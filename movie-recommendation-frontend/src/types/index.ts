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
  tmdbId?: number;
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
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface SearchFilters {
  query?: string;
  genre?: number;
  releaseDateFrom?: string;
  releaseDateTo?: string;
  language?: string;
  minRating?: number;
  maxRating?: number;
  year?: number;
  minRuntime?: number;
  maxRuntime?: number;
  adult?: boolean;
  certification?: string;
  sortBy?: 'popularity' | 'vote_average' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Component Props types
export interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movie: Movie) => void;
  onAddToWatchlist?: (movie: Movie) => void;
  onRemoveFromWatchlist?: (movie: Movie) => void;
  isInWatchlist?: boolean;
  showWatchlistButton?: boolean;
}

export interface MovieListProps {
  movies: Movie[];
  title?: string;
  loading?: boolean;
  onMovieClick?: (movie: Movie) => void;
  showWatchlistButton?: boolean;
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
