import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';

export interface ISettingsState {
  viewFavourite: boolean;
  viewUserPosts: boolean;
}
  
const initialState: ISettingsState = {
  viewFavourite: true,
  viewUserPosts: true
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setViewFavourite: (state, data: {payload: boolean, type: any}) => {
      state.viewFavourite = data.payload;
    },
    setViewUserPosts: (state, data: {payload: boolean, type: any}) => {
      state.viewUserPosts = data.payload;
    }
  },
})

export const { setViewFavourite, setViewUserPosts } = settingsSlice.actions;
export const selectSettings = (state: RootState) => state.settings;
export default settingsSlice.reducer;