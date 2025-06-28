// store/slices/agentSlice.ts
import {
  createSlice,
  createAsyncThunk,
  ThunkAction,
  AnyAction,
} from "@reduxjs/toolkit";
import { db } from "../../app/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { signOut } from "./authSlice";
import { setAgentListener, clearAgentListener } from "./listenerSlice";
import { RootState } from "../store";
import { analytics } from "@/app/config/firebase";
import { logEvent } from "@react-native-firebase/analytics";

export const setAgentDataState = createAsyncThunk(
  "agent/setAgentDataState",
  async (phoneNumber: string, { rejectWithValue, dispatch }) => {
    try {
      const q = query(
        collection(db, "acnAgents"),
        where("phoneNumber", "==", phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return {
          docData: docSnap.data(),
          docId: docSnap.id,
          phoneNumber,
        };
      } else {
        dispatch(signOut());
        throw new Error("No user found with this phone number.");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const listenToAgentChanges =
  (agentId: string): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    dispatch(clearAgentListener());
    const docRef = doc(db, "acnAgents", agentId);

    let previousVerificationStatus: boolean | undefined;
    let isInitialSnapshot = true;

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const newData = docSnap.data();
          const currentVerificationStatus = newData.verified;

          // Track initial verification state
          if (isInitialSnapshot) {
            try {
              logEvent(analytics, "agent_verification_initial_state", {
                event_category: "auth",
                event_label: "verification",
                status: currentVerificationStatus ? "verified" : "unverified",
                phone_number: newData.phoneNumber,
                user_type: newData.userType || "free",
              });
            } catch (error) {
              console.error("Error logging initial verification state:", error);
            }
            isInitialSnapshot = false;
          }

          // Check if verification status has changed
          if (
            previousVerificationStatus !== undefined &&
            previousVerificationStatus !== currentVerificationStatus
          ) {
            try {
              logEvent(analytics, "agent_verification_status_change", {
                event_category: "auth",
                event_label: "verification",
                new_status: currentVerificationStatus
                  ? "verified"
                  : "unverified",
                previous_status: previousVerificationStatus
                  ? "verified"
                  : "unverified",
                phone_number: newData.phoneNumber,
                user_type: newData.userType || "free",
                verified_at: newData.verifiedAt || null,
                verified_by: newData.verifiedBy || null,
                time_to_verify: currentVerificationStatus
                  ? ((newData.verifiedAt || Date.now()) - newData.added) / 1000 // Time in seconds
                  : null,
              });
            } catch (error) {
              console.error("Error logging verification status change:", error);
            }
          }

          // Update previous status for next comparison
          previousVerificationStatus = currentVerificationStatus;

          dispatch(
            setUserDoc({
              docData: newData,
              docId: docSnap.id,
            })
          );
        } else {
          // Track document deletion or non-existence
          try {
            logEvent(analytics, "agent_document_missing", {
              event_category: "auth",
              event_label: "error",
              agent_id: agentId,
              previous_verification_status: previousVerificationStatus,
            });
          } catch (error) {
            console.error("Error logging document missing:", error);
          }
          dispatch(resetAgentState());
          dispatch(signOut());
        }
      },
      (error) => {
        // Track listener errors
        try {
          logEvent(analytics, "agent_verification_listener_error", {
            event_category: "auth",
            event_label: "error",
            error_message: error.message,
            agent_id: agentId,
          });
        } catch (analyticsError) {
          console.error("Error logging listener error:", analyticsError);
        }
        console.error("Agent listener error:", error);
        dispatch(setError(error.message));
      }
    );

    dispatch(setAgentListener(unsubscribe));

    // Return unsubscribe function for cleanup
    return unsubscribe;
  };

const agentSlice = createSlice({
  name: "agent",
  initialState: {
    loading: false,
    error: null as string | null,
    phoneNumber: null as string | null,
    docData: null as any,
    docId: null as string | null,
    isAgentInDb: false,
  },
  reducers: {
    setPhonenumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    setUserDoc: (state, action) => {
      const { docData, docId } = action.payload;
      if (docData) {
        state.docData = docData;
        state.docId = docId;
        state.isAgentInDb = true;
      } else {
        state.docData = null;
        state.docId = null;
        state.isAgentInDb = false;
      }
    },
    setMonthlyCredit: (state, action) => {
      if (state.docData) {
        state.docData = {
          ...state.docData,
          monthlyCredits: action.payload.monthlyCredits,
          boosterCredits: action.payload.boosterCredits,
        };
      }
    },
    resetAgentState: (state) => {
      state.loading = false;
      state.error = null;
      state.phoneNumber = null;
      state.docData = null;
      state.docId = null;
      state.isAgentInDb = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateAgentDocData: (state, action) => {
      if (state.docData) {
        state.docData = {
          ...state.docData,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAgentDataState.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAgentInDb = false;
      })
      .addCase(setAgentDataState.fulfilled, (state, action) => {
        state.loading = false;
        state.docData = action.payload.docData;
        state.docId = action.payload.docId;
        state.isAgentInDb = true;
      })
      .addCase(setAgentDataState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAgentInDb = false;
      });
  },
});

export const {
  setPhonenumber,
  setUserDoc,
  setMonthlyCredit,
  resetAgentState,
  setError,
  updateAgentDocData,
} = agentSlice.actions;

export const selectVerified = (state: RootState): boolean =>
  state?.agent?.docData?.verified || false;

export const selectAdmin = (state: RootState): boolean =>
  state?.agent?.docData?.admin || false;

export const selectBlacklisted = (state: RootState): boolean =>
  state?.agent?.docData?.blacklisted || false;

export const selectName = (state: RootState): string =>
  state?.agent?.docData?.name || "";

export const selectMyKam = (state: RootState): any =>
  state?.agent?.docData?.kamId || null;

export default agentSlice.reducer;
