import { createSlice, PayloadAction, ThunkAction, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Requirement } from '@/app/types';

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
  name: 'requirement',
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
    setRequirementStatus: (state, action: PayloadAction<string | null>) => {
      if (state.requirementDocData) {
        state.requirementDocData.status = action.payload;
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
    }
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
  resetError
} = requirementSlice.actions;

// Thunk action to set requirement data
export const setRequirementDataThunk = (requirement: Requirement): ThunkAction<
  void,
  RootState,
  unknown,
  AnyAction
> => (dispatch, getState) => {
  dispatch(setRequirementData(requirement));
};

// Export selector to get requirement state
export const selectRequirementState = (state: RootState) => state.requirement;
export const selectRequirementStateData = (state: RootState) => state.requirement.requirementDocData;

// Export reducer
export default requirementSlice.reducer;