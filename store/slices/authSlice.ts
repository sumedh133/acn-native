// store/slices/authSlice.ts
import { AnyAction, createSlice, ThunkAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { resetAgentState } from "./agentSlice";
import { clearAgentListener } from "./listenerSlice";
import { resetKamState } from "./kamSlice";
import { setVersionListener, clearVersionListener } from "./listenerSlice";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../app/config/firebase";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

let timeoutId: NodeJS.Timeout | null = null;

export const listenToVersionChanges =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(clearVersionListener());

    const currentVersion = String(getState().auth.version || "");
    const docRef = doc(db, "acn-admin", "version");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          let newVersion = docSnapshot.data().version;
          if (!newVersion) return;
          newVersion = String(newVersion);

          if (currentVersion !== newVersion) {
            dispatch(setVersion(newVersion));
            router.dismissAll();
            router.replace("/"); // Use navigation instead of reload
          }
        }
      },
      (error) => {
        console.error("Version listener error:", error);
        dispatch(setError(error.message));
      },
    );

    dispatch(setVersionListener(unsubscribe));
  };

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    version: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    signIn: (state) => {
      state.isAuthenticated = true;
    },
    signOut: (state) => {
      state.isAuthenticated = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    },
    setError: (state, action) => {
      state.error = String(action.payload);
    },
  },
});

export const logOut =
  (): ThunkAction<
    Promise<void>, // Return type
    RootState, // State type
    unknown, // Extra args type
    AnyAction // Action type
  > =>
  async (dispatch, getState) => {
    if (getState().auth.loading) return;

    dispatch(setLoading(true));

    try {
      await auth().signOut();
      dispatch(clearAgentListener());
      dispatch(clearVersionListener());
      dispatch(resetAgentState());
      dispatch(resetKamState());

      setTimeout(() => {
        dispatch(signOut());
      }, 200);
    } catch (error: unknown) {
      console.error("Logout error:", error);
      dispatch(clearAgentListener());
      dispatch(clearVersionListener());
      dispatch(signOut());
      dispatch(resetAgentState());
      dispatch(resetKamState());
    } finally {
      dispatch(setLoading(false));
    }
  };

export const handleSessionTimeout = () => (dispatch: AppDispatch) => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(
    () => {
      dispatch(logOut());
    },
    60 * 60 * 1000,
  );
};

export const { signIn, signOut, setLoading, setVersion, setError } =
  authSlice.actions;
export default authSlice.reducer;
