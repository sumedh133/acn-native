import {
  createSlice,
  PayloadAction,
  ThunkAction,
  AnyAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Requirement } from "@/app/types";
import { db } from "@/app/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  setRequirementListener,
  clearRequirementListener,
} from "./listenerSlice";

// Define the requirement state interface
interface RequirementState {
  loading: boolean;
  error: string | null;
  requirementId: string | null;
  requirementDocData: Requirement | null;
}

// Initial state
const initialState: RequirementState = {
  loading: false,
  error: null,
  requirementId: null,
  requirementDocData: null,
};

const requirementSlice = createSlice({
  name: "requirement",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRequirementId: (state, action: PayloadAction<string | null>) => {
      state.requirementId = action.payload;
    },
    setRequirementData: (state, action: PayloadAction<Requirement>) => {
      const { requirementId, ...requirementData } = action.payload;
      state.requirementId = requirementId!;
      state.requirementDocData = action.payload;
    },
    setRequirementStatus: (state, action: PayloadAction<"open" | "close">) => {
      if (state.requirementDocData) {
        state.requirementDocData.requirementStatus = action.payload;
      }
    },
    resetRequirementState: (state) => {
      state.loading = false;
      state.error = null;
      state.requirementId = null;
      state.requirementDocData = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setRequirementId,
  setRequirementData,
  setRequirementStatus,
  resetRequirementState,
  setError,
  resetError,
} = requirementSlice.actions;

// Thunk action to set requirement data
export const setRequirementDataThunk =
  (
    requirement: Requirement
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    dispatch(setRequirementData(requirement));
  };

// Thunk action to listen to requirement changes
export const listenToRequirementChanges =
  (requirementId: string): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    dispatch(clearRequirementListener());
    const docRef = doc(db, "requirements", requirementId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        dispatch(setRequirementData(docSnap.data() as Requirement));
      }
    });
    dispatch(setRequirementListener(unsubscribe));
    return unsubscribe;
  };

// Export selector to get requirement state
export const selectRequirementState = (state: RootState) => state.requirement;
export const selectRequirementStateData = (state: RootState) =>
  state.requirement.requirementDocData;

// Export reducer
export default requirementSlice.reducer;
