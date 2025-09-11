import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { searchMovies, fetchGenres } from '../store/slices/movieSlice';
import MovieList from '../components/movies/MovieList';
import { Movie, SearchFilters } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    searchResults,
    genres,
    loading,
    searchFilters,
    pagination,
  } = useAppSelector((state) => state.movies);

  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1);
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    genre: searchParams.get('genre') ? parseInt(searchParams.get('genre')!) : undefined,
    releaseDateFrom: searchParams.get('releaseDateFrom') || undefined,
    releaseDateTo: searchParams.get('releaseDateTo') || undefined,
    language: searchParams.get('language') || undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    maxRating: searchParams.get('maxRating') ? parseFloat(searchParams.get('maxRating')!) : undefined,
    sortBy: (searchParams.get('sortBy') as 'popularity' | 'vote_average' | 'release_date' | 'title') || 'popularity',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  useEffect(() => {
    // Fetch genres on component mount
    dispatch(fetchGenres());
  }, [dispatch]);

  useEffect(() => {
    // Perform search when URL params change
    const query = searchParams.get('q');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const releaseDateFrom = searchParams.get('releaseDateFrom');
    const releaseDateTo = searchParams.get('releaseDateTo');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');

    // Check if we have any search criteria (query or filters)
    const hasSearchCriteria = query || genre || language || releaseDateFrom || releaseDateTo || minRating || maxRating;

    if (hasSearchCriteria) {
      setLocalQuery(query || '');
      setCurrentPage(page);

      const filters: SearchFilters = {
        query: query || undefined,
        genre: genre ? parseInt(genre) : undefined,
        language: language || undefined,
        releaseDateFrom: releaseDateFrom || undefined,
        releaseDateTo: releaseDateTo || undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        maxRating: maxRating ? parseFloat(maxRating) : undefined,
        sortBy: (searchParams.get('sortBy') as 'popularity' | 'vote_average' | 'release_date' | 'title') || 'popularity',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      setLocalFilters(filters);
      dispatch(searchMovies({ filters, page }));
    }
  }, [searchParams, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim() || hasActiveFilters()) {
      const newFilters = { ...localFilters, query: localQuery.trim() || undefined };
      setCurrentPage(1);
      updateURLAndSearch(newFilters, 1);
    }
  };

  const handleFilterChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    const newFilters = { ...localFilters, [key]: value };
    console.log(newFilters);
    setLocalFilters(newFilters);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    updateURLAndSearch(localFilters, 1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: localQuery,
      sortBy: 'popularity',
      sortOrder: 'desc',
    };
    setLocalFilters(clearedFilters);
    setCurrentPage(1);
    updateURLAndSearch(clearedFilters, 1);
  };

  const updateURLAndSearch = (filters: SearchFilters, page: number = 1) => {
    const params = new URLSearchParams();

    if (filters.query) params.set('q', filters.query);
    if (filters.genre) params.set('genre', filters.genre.toString());
    if (filters.releaseDateFrom) params.set('releaseDateFrom', filters.releaseDateFrom);
    if (filters.releaseDateTo) params.set('releaseDateTo', filters.releaseDateTo);
    if (filters.language) params.set('language', filters.language);
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.maxRating) params.set('maxRating', filters.maxRating.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (page > 1) params.set('page', page.toString());

    setSearchParams(params);
    setCurrentPage(page);
    dispatch(searchMovies({ filters, page }));
  };

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
  };

  const hasActiveFilters = () => {
    return !!(localFilters.genre || localFilters.releaseDateFrom || localFilters.releaseDateTo ||
      localFilters.language || localFilters.minRating || localFilters.maxRating);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.genre) count++;
    if (localFilters.releaseDateFrom || localFilters.releaseDateTo) count++;
    if (localFilters.language) count++;
    if (localFilters.minRating || localFilters.maxRating) count++;
    return count;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Search Movies
        </Typography>

          {/* Search Form */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              maxWidth: { xs: '100%', sm: 600, md: 700 },
              mx: 'auto',
            }}
          >
          <TextField
            fullWidth
            placeholder="Search for movies or use filters below..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
            disabled={!localQuery.trim() && !hasActiveFilters()}
          >
            Search
          </Button>
        </Paper>

        {/* Filters Toggle */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          mb: 2,
          maxWidth: { xs: '100%', sm: 600, md: 700 },
          mx: 'auto',
          justifyContent: 'center'
        }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>

          {hasActiveFilters() && (
            <Button
              variant="text"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              color="secondary"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 2,
            maxWidth: { xs: '100%', sm: 600, md: 700 },
            mx: 'auto',
            justifyContent: 'center'
          }}>
            {localFilters.genre && (
              <Chip
                label={`Genre: ${genres.find(g => g.tmdbId === localFilters.genre)?.name || 'Unknown'}`}
                onDelete={() => handleFilterChange('genre', undefined)}
                color="primary"
                variant="outlined"
              />
            )}
            {(localFilters.releaseDateFrom || localFilters.releaseDateTo) && (
              <Chip
                label={`Release: ${localFilters.releaseDateFrom || 'Any'} - ${localFilters.releaseDateTo || 'Any'}`}
                onDelete={() => {
                  setLocalFilters(prev => ({
                    ...prev,
                    releaseDateFrom: undefined,
                    releaseDateTo: undefined,
                  }));
                }}
                color="primary"
                variant="outlined"
              />
            )}
            {localFilters.language && (
              <Chip
                label={`Language: ${localFilters.language.toUpperCase()}`}
                onDelete={() => handleFilterChange('language', undefined)}
                color="primary"
                variant="outlined"
              />
            )}
            {(localFilters.minRating || localFilters.maxRating) && (
              <Chip
                label={`Rating: ${localFilters.minRating || 0} - ${localFilters.maxRating || 10}`}
                onDelete={() => {
                  setLocalFilters(prev => ({
                    ...prev,
                    minRating: undefined,
                    maxRating: undefined,
                  }));
                }}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Filters Panel */}
      {showFilters && (
        <Paper sx={{ mb: 4 }}>
          <Accordion expanded={showFilters} onChange={() => setShowFilters(!showFilters)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {/* Genre Filter */}
                <FormControl fullWidth>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    value={localFilters.genre?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const genreId = value ? Number(value) : undefined;
                      handleFilterChange('genre', genreId);
                    }}
                    label="Genre"
                  >
                    <MenuItem value="">Any Genre</MenuItem>
                    {genres.map((genre) => (
                      <MenuItem key={genre.tmdbId} value={genre.tmdbId}>
                        {genre.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Language Filter */}
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={localFilters.language || ''}
                    onChange={(e) => handleFilterChange('language', e.target.value || undefined)}
                    label="Language"
                  >
                    <MenuItem value="">Any Language</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="it">Italian</MenuItem>
                    <MenuItem value="pt">Portuguese</MenuItem>
                    <MenuItem value="ru">Russian</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                    <MenuItem value="ko">Korean</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                  </Select>
                </FormControl>

                {/* Release Date Range */}
                <TextField
                  label="Release Date From"
                  type="date"
                  value={localFilters.releaseDateFrom || ''}
                  onChange={(e) => handleFilterChange('releaseDateFrom', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Release Date To"
                  type="date"
                  value={localFilters.releaseDateTo || ''}
                  onChange={(e) => handleFilterChange('releaseDateTo', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Rating Range */}
                <Box>
                  <Typography gutterBottom>Rating Range</Typography>
                  <Slider
                    value={[localFilters.minRating || 0, localFilters.maxRating || 10]}
                    onChange={(_, newValue) => {
                      const [min, max] = newValue as number[];
                      setLocalFilters(prev => ({
                        ...prev,
                        minRating: min,
                        maxRating: max,
                      }));
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10}
                    step={0.1}
                      marks={[...Array(6).keys()].map(i => ({ value: i * 2, label: i * 2 }))}
                  />
                </Box>

                {/* Sort Options */}
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={localFilters.sortBy || 'popularity'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="popularity">Popularity</MenuItem>
                    <MenuItem value="release_date">Release Date</MenuItem>
                    <MenuItem value="vote_average">Rating</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}

      {/* Search Results */}
      {(localQuery || hasActiveFilters()) && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {localQuery
              ? `Search Results for "${localQuery}"`
              : "Filtered Movies"
            }
            {pagination.totalResults > 0 && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({pagination.totalResults.toLocaleString()} results)
              </Typography>
            )}
          </Typography>

          {loading.isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={60} />
            </Box>
          ) : loading.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loading.error}
            </Alert>
          ) : searchResults.length > 0 ? (
            <MovieList
              movies={searchResults}
              loading={loading.isLoading}
              showWatchlistButton={true}
              onMovieClick={handleMovieClick}
            />
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No movies found matching your search criteria.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or filters.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* No Search Query or Filters */}
      {!localQuery && !hasActiveFilters() && (
        <Box textAlign="center" py={8}>
          <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            Search for Movies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter a movie title, actor name, or use our advanced filters to find the perfect movie.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage;

