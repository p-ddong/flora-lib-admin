import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plantReducer from './plantSlice';
import contributeReducer from './contributeSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plant: plantReducer,
    contribute: contributeReducer,
    user: userReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
