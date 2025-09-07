import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showNewEnquiryPopup: false
  },
  reducers: {
    openNewEnquiryPopup: (state) => {
      state.showNewEnquiryPopup = true;
    },
    closeNewEnquiryPopup: (state) => {
      state.showNewEnquiryPopup = false;
    }
  }
});

export const { openNewEnquiryPopup, closeNewEnquiryPopup } = uiSlice.actions;
export default uiSlice.reducer;
