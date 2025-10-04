// Enums
export const LikeStatus = {
  Liked: 1,
  Disliked: 2
} as const;

export type LikeStatus = typeof LikeStatus[keyof typeof LikeStatus];

// Movie related types
export interface Movie {
  id: number;
  title: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
  voteCount?: number;
  posterPath?: string;
  backdropPath?: string;
  tmdbId: number;
  isAdult: boolean;
  originalLanguage?: string;
  originalTitle?: string;
  popularity?: number;
  genres: string[];
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: number;
  name: string;
  tmdbId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: number;
  userId: number;
  movieId: number;
  score: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}


// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface MovieState {
  movies: Movie[];
  trendingMovies: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  searchResults: Movie[];
  currentMovie: Movie | null;
  genres: Genre[];
  watchlist: Movie[];
  loading: LoadingState;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface UpdateProfileForm {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface SearchFilters {
  query?: string;
  genres?: number[]; // Support multiple genres
  releaseYear?: number; // Simple year filter
  minRating?: number;
  minVoteCount?: number;
  adult?: boolean;
  sortBy?: 'popularity' | 'vote_average' | 'release_date' | 'title';
}

// Component Props types
export interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
  onRemoveFromWatchlist?: (movie: Movie) => void;
  isInWatchlist?: boolean;
  showWatchlistButton?: boolean;
  showLikeButtons?: boolean;
}

export interface MovieListProps {
  movies: Movie[];
  title?: string;
  loading?: boolean;
  onMovieClick?: (movie: Movie) => void;
  showWatchlistButton?: boolean;
  showLikeButtons?: boolean;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  genres: Genre[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

// LikeList related types
export interface LikeListItem {
  id: number;
  movieId: number;
  movie: Movie;
  status: LikeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AddToLikeListRequest {
  MovieId: number;
  Status: LikeStatus;
}
