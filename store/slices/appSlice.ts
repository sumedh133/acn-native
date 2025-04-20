import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AppState = {
    isConnectedToInternet: boolean;
}

const initialState: AppState = {
    isConnectedToInternet: true
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setIsConnectedToInternet: (state, action: PayloadAction<boolean>) => {
            state.isConnectedToInternet = action.payload;
        }
    }
})

export const {
    setIsConnectedToInternet
} = appSlice.actions;

export default appSlice.reducer;