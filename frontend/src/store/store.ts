import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import kolSlice from './slices/kolSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    kol: kolSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;