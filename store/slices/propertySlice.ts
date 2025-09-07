import {
  createSlice,
  PayloadAction,
  ThunkAction,
  AnyAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Property } from "@/app/types";
import { db } from "@/app/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { setPropertyListener, clearPropertyListener } from "./listenerSlice";

// Define the property state interface
interface PropertyState {
  loading: boolean;
  error: string | null;
  propertyId: string | null;
  propertyDocData: any | null;
}

// Initial state
const initialState: PropertyState = {
  loading: false,
  error: null,
  propertyId: null,
  propertyDocData: null,
};

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPropertyId: (state, action: PayloadAction<string | null>) => {
      state.propertyId = action.payload;
    },
    setPropertyData: (state, action: PayloadAction<Property>) => {
      const { propertyId, ...propertyData } = action.payload;
      state.propertyId = propertyId ?? null;
      state.propertyDocData = action.payload;
    },
    setPropertyStatus: (state, action: PayloadAction<string | null>) => {
      state.propertyDocData.status = action.payload;
    },
    resetPropertyState: (state) => {
      state.loading = false;
      state.error = null;
      state.propertyId = null;
      state.propertyDocData = null;
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
  setPropertyId,
  setPropertyData,
  setPropertyStatus,
  resetPropertyState,
  setError,
  resetError,
} = propertySlice.actions;

// Thunk action to set property data
export const setPropertyDataThunk =
  (property: Property): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    const { propertyId: currentPropertyId } = getState().property;

    dispatch(setPropertyData(property));
  };

// Thunk action to listen to property changes
export const listenToPropertyChanges =
  (propertyId: string): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    dispatch(clearPropertyListener());
    const docRef = doc(db, "acnTestProperties", propertyId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        dispatch(setPropertyData(docSnap.data() as Property));
      }
    });
    dispatch(setPropertyListener(unsubscribe));
    return unsubscribe;
  };

// Export selector to get property state
export const selectPropertyState = (state: RootState) => state.property;
export const selectPropertyStateData = (state: RootState) =>
  state.property.propertyDocData;

// Export reducer
export default propertySlice.reducer;
