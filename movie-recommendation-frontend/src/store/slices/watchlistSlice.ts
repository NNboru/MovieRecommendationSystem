import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types';
import { movieApi } from '../../services/api';

interface WatchlistState {
  movies: Movie[];
  loading: {
    isLoading: boolean;
    error?: string;
  };
}

const initialState: WatchlistState = {
  movies: [],
  loading: {
    isLoading: false,
  },
};

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await movieApi.getWatchlist();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch watchlist');
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/addToWatchlist',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const response = await movieApi.addToWatchlist(movieId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add movie to watchlist');
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async (movieId: number, { rejectWithValue }) => {
    try {
      await movieApi.removeFromWatchlist(movieId);
      return movieId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove movie from watchlist');
    }
  }
);

export const checkIsInWatchlist = createAsyncThunk(
  'watchlist/checkIsInWatchlist',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const response = await movieApi.isInWatchlist(movieId);
      return { movieId, isInWatchlist: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check watchlist status');
    }
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.loading.error = undefined;
    },
    clearWatchlist: (state) => {
      state.movies = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.movies = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      })
      // Add to watchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        // Add the movie to the watchlist if it's not already there
        const existingMovie = state.movies.find(movie => movie.tmdbId === action.payload.id);
        if (!existingMovie) {
          state.movies.unshift(action.payload);
        }
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.movies = state.movies.filter(movie => movie.tmdbId !== action.payload);
      })
      // Check is in watchlist (this is mainly for optimistic updates)
      .addCase(checkIsInWatchlist.fulfilled, (state, action) => {
        // This can be used for optimistic updates or UI state management
        // The actual watchlist state is managed by fetchWatchlist
      });
  },
});

export const { clearError, clearWatchlist } = watchlistSlice.actions;

export default watchlistSlice.reducer;
