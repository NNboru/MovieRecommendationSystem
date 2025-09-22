import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, Genre, SearchFilters } from '../../types';
import { movieApi } from '../../services/api';

interface MovieState {
  movies: Movie[];
  trendingMovies: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  searchResults: Movie[];
  currentMovie: Movie | null;
  genres: Genre[];
  watchlist: Movie[];
  loading: {
    isLoading: boolean;
    error?: string;
  };
  searchFilters: SearchFilters;
  pagination: {
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

const initialState: MovieState = {
  movies: [],
  trendingMovies: [],
  popularMovies: [],
  topRatedMovies: [],
  searchResults: [],
  currentMovie: null,
  genres: [],
  watchlist: [],
  loading: {
    isLoading: false,
  },
  searchFilters: {},
  pagination: {
    page: 1,
    totalPages: 0,
    totalResults: 0,
  },
};

// Async thunks
export const fetchTrendingMovies = createAsyncThunk(
  'movies/fetchTrending',
  async (page: number = 1) => {
    const response = await movieApi.getTrendingMovies(page);
    return response;
  }
);

export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopular',
  async (page: number = 1) => {
    const response = await movieApi.getPopularMovies(page);
    return response;
  }
);

export const fetchTopRatedMovies = createAsyncThunk(
  'movies/fetchTopRated',
  async (page: number = 1) => {
    const response = await movieApi.getTopRatedMovies(page);
    return response;
  }
);

export const searchMovies = createAsyncThunk(
  'movies/search',
  async ({ filters, page = 1 }: { filters: SearchFilters; page?: number }) => {
    const response = await movieApi.searchMovies(filters, page);
    return response;
  }
);

export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchDetails',
  async (movieId: number) => {
    const response = await movieApi.getMovieDetails(movieId);
    return response;
  }
);

export const fetchGenres = createAsyncThunk(
  'movies/fetchGenres',
  async () => {
    const response = await movieApi.getGenres();
    return response;
  }
);

export const fetchWatchlist = createAsyncThunk(
  'movies/fetchWatchlist',
  async (userId: number) => {
    const response = await movieApi.getWatchlist();
    return response;
  }
);

export const addToWatchlist = createAsyncThunk(
  'movies/addToWatchlist',
  async ({ userId, movieId }: { userId: number; movieId: number }) => {
    const response = await movieApi.addToWatchlist(movieId);
    return response;
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'movies/removeFromWatchlist',
  async ({ userId, movieId }: { userId: number; movieId: number }) => {
    const response = await movieApi.removeFromWatchlist(movieId);
    return response;
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.searchFilters = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setCurrentMovie: (state, action: PayloadAction<Movie | null>) => {
      state.currentMovie = action.payload;
    },
    clearError: (state) => {
      state.loading.error = undefined;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trending movies
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchTrendingMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.trendingMovies = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalResults: action.payload.totalResults,
        };
      })
      .addCase(fetchTrendingMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.error.message;
      })
      // Fetch popular movies
      .addCase(fetchPopularMovies.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.popularMovies = action.payload.data;
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.error.message;
      })
      // Fetch top rated movies
      .addCase(fetchTopRatedMovies.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.topRatedMovies = action.payload.data;
      })
      .addCase(fetchTopRatedMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.error.message;
      })
      // Search movies
      .addCase(searchMovies.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.searchResults = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalResults: action.payload.totalResults,
        };
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.error.message;
      })
      // Fetch movie details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.error.message;
      })
      // Fetch genres
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
      })
      // Fetch watchlist
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.watchlist = action.payload;
      })
      // Add to watchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.watchlist.push(action.payload);
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter(
          (movie) => movie.tmdbId !== action.payload.movieId
        );
      });
  },
});

export const {
  setSearchFilters,
  clearSearchResults,
  setCurrentMovie,
  clearError,
  setPage,
} = movieSlice.actions;

export default movieSlice.reducer;
