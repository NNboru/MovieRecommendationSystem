import axios, { AxiosResponse } from 'axios';
import {
  Movie,
  Genre,
  User,
  LoginForm,
  RegisterForm,
  UpdateProfileForm,
  ChangePasswordForm,
  AuthResponse,
  SearchFilters,
  PaginatedResponse,
  LikeListItem,
  LikeStatus,
  RecommendationResult,
  UserRecommendationData,
} from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:5233/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.href.includes('login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Movie API
export const movieApi = {
  // Get trending movies from our backend
  getTrendingMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(
      `/movies/trending?page=${page}`
    );
    return response.data;
  },

  // Get popular movies from our backend
  getPopularMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(
      `/movies/popular?page=${page}`
    );
    return response.data;
  },

  // Get top rated movies from our backend
  getTopRatedMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(
      `/movies/top-rated?page=${page}`
    );
    return response.data;
  },

  // Text search - only query parameter
  textSearchMovies: async (query: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());

    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(
      `/movies/text-search?${params.toString()}`
    );
    return response.data;
  },

  // Discovery - only filters, no query
  discoverMovies: async (filters: Omit<SearchFilters, 'query'>, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const params = new URLSearchParams();

    // Support multiple genres
    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach(genre => params.append('genres', genre.toString()));
    }
    if (filters.releaseYear) params.append('releaseYear', filters.releaseYear.toString());
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.minVoteCount) params.append('minVoteCount', filters.minVoteCount.toString());
    if (filters.adult !== undefined) params.append('adult', filters.adult.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    params.append('page', page.toString());

    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(
      `/movies/discover?${params.toString()}`
    );
    return response.data;
  },

  // Get movie details from our backend (using TMDB ID)
  getMovieDetails: async (tmdbId: number): Promise<Movie> => {
    const response: AxiosResponse<Movie> = await apiClient.get(`/movies/tmdb/${tmdbId}?append_to_response=videos`);
    return response.data;
  },

  // Get genres from our backend
  getGenres: async (): Promise<Genre[]> => {
    const response: AxiosResponse<Genre[]> = await apiClient.get('/genres');
    return response.data;
  },

  // Get watchlist
  getWatchlist: async (): Promise<Movie[]> => {
    const response: AxiosResponse<Movie[]> = await apiClient.get('/watchlist/getWatchlist');
    return response.data;
  },

  // Add to watchlist
  addToWatchlist: async (movieId: number): Promise<Movie> => {
    const response: AxiosResponse<Movie> = await apiClient.post(
      '/watchlist/addToWatchlist',
      { MovieId: movieId }
    );
    return response.data;
  },

  // Remove from watchlist
  removeFromWatchlist: async (movieId: number): Promise<{ movieId: number }> => {
    await apiClient.delete(`/watchlist/${movieId}`);
    return { movieId };
  },

  // Check if movie is in watchlist
  isInWatchlist: async (movieId: number): Promise<boolean> => {
    const response: AxiosResponse<{ isInWatchlist: boolean }> = await apiClient.get(`/watchlist/check/${movieId}`);
    return response.data.isInWatchlist;
  },

  // Get movie recommendations
  getMovieRecommendations: async (movieId: number): Promise<PaginatedResponse<Movie>> => {
    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(`/movies/${movieId}/recommendations`);
    return response.data;
  },

  // Get similar movies
  getSimilarMovies: async (movieId: number): Promise<PaginatedResponse<Movie>> => {
    const response: AxiosResponse<PaginatedResponse<Movie>> = await apiClient.get(`/movies/${movieId}/similar`);
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (userData: RegisterForm): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      '/auth/register',
      userData
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: UpdateProfileForm): Promise<User> => {
    const response: AxiosResponse<User> = await apiClient.put(
      '/auth/profile',
      userData
    );
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordForm): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await apiClient.post(
      '/auth/change-password',
      passwordData
    );
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete('/auth/account');
    return response.data;
  },
};

// LikeList API
export const likeListApi = {
  getLikeList: async (): Promise<LikeListItem[]> => {
    const response: AxiosResponse<LikeListItem[]> = await apiClient.get('/likelist/getLikeList');
    return response.data;
  },

  addToLikeList: async (movieId: number, status: LikeStatus): Promise<LikeListItem> => {
    const response: AxiosResponse<LikeListItem> = await apiClient.post('/likelist/addToLikeList', {
      MovieId: movieId,
      Status: status,
    });
    return response.data;
  },

  removeFromLikeList: async (movieId: number): Promise<{ message: string }> => {
    const response: AxiosResponse<{ message: string }> = await apiClient.delete(`/likelist/${movieId}`);
    return response.data;
  },

};

// Recommendation API
export const recommendationApi = {
  getPersonalizedRecommendations: async (page: number = 1): Promise<RecommendationResult> => {
    const response: AxiosResponse<RecommendationResult> = await apiClient.get(
      `/recommendations/personalized?page=${page}`
    );
    return response.data;
  },

  getUserRecommendationData: async (): Promise<UserRecommendationData> => {
    const response: AxiosResponse<UserRecommendationData> = await apiClient.get(
      '/recommendations/user-data'
    );
    return response.data;
  },
};

