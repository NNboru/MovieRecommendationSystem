import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LikeListItem, LikeStatus } from '../../types';
import { likeListApi } from '../../services/api';

interface LikeListState {
  likedMovies: LikeListItem[];
  dislikedMovies: LikeListItem[];
  loading: boolean;
  error: string | null;
  likeStatuses: { [movieId: number]: LikeStatus | null }; // Track like status for each movie
}

const initialState: LikeListState = {
  likedMovies: [],
  dislikedMovies: [],
  loading: false,
  error: null,
  likeStatuses: {},
};

export const fetchLikeList = createAsyncThunk(
  'likeList/fetchLikeList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await likeListApi.getLikeList();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch like list');
    }
  }
);

export const addToLikeList = createAsyncThunk(
  'likeList/addToLikeList',
  async ({ movieId, status }: { movieId: number; status: LikeStatus }, { rejectWithValue }) => {
    try {
      const response = await likeListApi.addToLikeList(movieId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to like list');
    }
  }
);

export const removeFromLikeList = createAsyncThunk(
  'likeList/removeFromLikeList',
  async (movieId: number, { rejectWithValue }) => {
    try {
      await likeListApi.removeFromLikeList(movieId);
      return movieId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from like list');
    }
  }
);

export const checkLikeStatus = createAsyncThunk(
  'likeList/checkLikeStatus',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const response = await likeListApi.checkLikeStatus(movieId);
      return { movieId, status: response.status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check like status');
    }
  }
);

const likeListSlice = createSlice({
  name: 'likeList',
  initialState,
  reducers: {
    clearLikeList: (state) => {
      state.likedMovies = [];
      state.dislikedMovies = [];
      state.likeStatuses = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch like list
      .addCase(fetchLikeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikeList.fulfilled, (state, action) => {
        state.loading = false;
        const likedMovies = action.payload.filter(item => item.status === LikeStatus.Liked);
        const dislikedMovies = action.payload.filter(item => item.status === LikeStatus.Disliked);
        
        state.likedMovies = likedMovies;
        state.dislikedMovies = dislikedMovies;
        
        // Update like statuses
        action.payload.forEach(item => {
          state.likeStatuses[item.movie.tmdbId] = item.status;
        });
      })
      .addCase(fetchLikeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add to like list
      .addCase(addToLikeList.fulfilled, (state, action) => {
        const { movie, status } = action.payload;
        
        // Remove from opposite list if it exists
        if (status === LikeStatus.Liked) {
          state.dislikedMovies = state.dislikedMovies.filter(item => item.movie.tmdbId !== movie.tmdbId);
          // Add to liked list if not already there
          const existingIndex = state.likedMovies.findIndex(item => item.movie.tmdbId === movie.tmdbId);
          if (existingIndex === -1) {
            state.likedMovies.push(action.payload);
          } else {
            state.likedMovies[existingIndex] = action.payload;
          }
        } else {
          state.likedMovies = state.likedMovies.filter(item => item.movie.tmdbId !== movie.tmdbId);
          // Add to disliked list if not already there
          const existingIndex = state.dislikedMovies.findIndex(item => item.movie.tmdbId === movie.tmdbId);
          if (existingIndex === -1) {
            state.dislikedMovies.push(action.payload);
          } else {
            state.dislikedMovies[existingIndex] = action.payload;
          }
        }
        
        // Update like status
        state.likeStatuses[movie.tmdbId] = status;
      })
      .addCase(addToLikeList.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Remove from like list
      .addCase(removeFromLikeList.fulfilled, (state, action) => {
        const movieId = action.payload;
        state.likedMovies = state.likedMovies.filter(item => item.movie.tmdbId !== movieId);
        state.dislikedMovies = state.dislikedMovies.filter(item => item.movie.tmdbId !== movieId);
        state.likeStatuses[movieId] = null;
      })
      .addCase(removeFromLikeList.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Check like status
      .addCase(checkLikeStatus.fulfilled, (state, action) => {
        const { movieId, status } = action.payload;
        if (status === 'none') {
          state.likeStatuses[movieId] = null;
        } else if (status === 'liked') {
          state.likeStatuses[movieId] = LikeStatus.Liked;
        } else if (status === 'disliked') {
          state.likeStatuses[movieId] = LikeStatus.Disliked;
        }
      })
      .addCase(checkLikeStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearLikeList, clearError } = likeListSlice.actions;

export default likeListSlice.reducer;
