import { configureStore } from '@reduxjs/toolkit'
import authReducer from './user-auth'
import settingsReducer from './user-settings'

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer
  },
})

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;