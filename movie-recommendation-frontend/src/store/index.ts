import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './slices/movieSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import watchlistReducer from './slices/watchlistSlice';

export const store = configureStore({
  reducer: {
    movies: movieReducer,
    auth: authReducer,
    ui: uiReducer,
    watchlist: watchlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

