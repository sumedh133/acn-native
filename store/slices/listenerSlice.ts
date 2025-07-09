// store/slices/listenerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ListenerState = {
  unsubscribeAgentListener: null | (() => void);
  unsubscribeVersionListener: null | (() => void);
  unsubscribePropertyListener: null | (() => void);
  unsubscribeRequirementListener: null | (() => void);
};

const initialState: ListenerState = {
  unsubscribeAgentListener: null,
  unsubscribeVersionListener: null,
  unsubscribePropertyListener: null,
  unsubscribeRequirementListener: null,
};

const listenerSlice = createSlice({
  name: "listeners",
  initialState,
  reducers: {
    setAgentListener: (state, action: PayloadAction<() => void>) => {
      state.unsubscribeAgentListener = action.payload;
    },
    clearAgentListener: (state) => {
      if (state.unsubscribeAgentListener) {
        state.unsubscribeAgentListener();
        state.unsubscribeAgentListener = null;
      }
    },
    setVersionListener: (state, action: PayloadAction<() => void>) => {
      state.unsubscribeVersionListener = action.payload;
    },
    clearVersionListener: (state) => {
      if (state.unsubscribeVersionListener) {
        state.unsubscribeVersionListener();
        state.unsubscribeVersionListener = null;
      }
    },
    setPropertyListener: (state, action: PayloadAction<() => void>) => {
      state.unsubscribePropertyListener = action.payload;
    },
    clearPropertyListener: (state) => {
      if (state.unsubscribePropertyListener) {
        state.unsubscribePropertyListener();
        state.unsubscribePropertyListener = null;
      }
    },
    setRequirementListener: (state, action: PayloadAction<() => void>) => {
      state.unsubscribeRequirementListener = action.payload;
    },
    clearRequirementListener: (state) => {
      if (state.unsubscribeRequirementListener) {
        state.unsubscribeRequirementListener();
        state.unsubscribeRequirementListener = null;
      }
    },
  },
});

export const {
  setAgentListener,
  clearAgentListener,
  setVersionListener,
  clearVersionListener,
  setPropertyListener,
  clearPropertyListener,
  setRequirementListener,
  clearRequirementListener,
} = listenerSlice.actions;

export default listenerSlice.reducer;
