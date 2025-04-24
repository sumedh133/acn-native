// store/slices/listenerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ListenerState = {
  unsubscribeAgentListener: null | (() => void);
  unsubscribeVersionListener: null | (() => void);
};

const initialState: ListenerState = {
  unsubscribeAgentListener: null,
  unsubscribeVersionListener: null,
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
  },
});

export const {
  setAgentListener,
  clearAgentListener,
  setVersionListener,
  clearVersionListener,
} = listenerSlice.actions;

export default listenerSlice.reducer;
