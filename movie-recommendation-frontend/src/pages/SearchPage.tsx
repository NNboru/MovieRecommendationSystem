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
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  MovieFilter as DiscoverIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { textSearchMovies, discoverMovies } from '../store/slices/movieSlice';
import MovieList from '../components/movies/MovieList';
import { Movie, SearchFilters } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    searchResults,
    genres,
    loading,
    pagination,
  } = useAppSelector((state) => state.movies);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Text search state
  const [textQuery, setTextQuery] = useState('');
  const [textSearchPage, setTextSearchPage] = useState(1);
  
  // Filter discovery state with enhanced defaults
  const [discoveryFilters, setDiscoveryFilters] = useState<Omit<SearchFilters, 'query'>>({
    genres: [],
    releaseYear: undefined,
    minRating: undefined,
    minVoteCount: 10,
    adult: true,
    sortBy: 'popularity',
  });
  const [discoveryPage, setDiscoveryPage] = useState(1);

  useEffect(() => {
    // Determine initial tab based on URL params
    const query = searchParams.get('q');
    const hasFilters = searchParams.get('genre') || searchParams.get('language') || 
                      searchParams.get('releaseDateFrom') || searchParams.get('releaseDateTo') ||
                      searchParams.get('minRating') || searchParams.get('maxRating');
    
    if (query) {
      setActiveTab(0); // Text search tab
      setTextQuery(query);
    } else if (hasFilters) {
      setActiveTab(1); // Discovery tab
    }
  }, [dispatch]);

  // Text Search Functions
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (textQuery.trim()) {
      setTextSearchPage(1);
      updateTextSearchURL(textQuery.trim(), 1);
      dispatch(textSearchMovies({ 
        query: textQuery.trim(), 
        page: 1 
      }));
    }
  };

  const updateTextSearchURL = (query: string, page: number = 1) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

  // Discovery Functions
  const handleDiscoverySearch = () => {
    setDiscoveryPage(1);
    updateDiscoveryURL(discoveryFilters, 1);
    dispatch(discoverMovies({ 
      filters: discoveryFilters, 
      page: 1 
    }));
  };

  const handleDiscoveryFilterChange = <K extends keyof Omit<SearchFilters, 'query'>>(
    key: K, 
    value: Omit<SearchFilters, 'query'>[K]
  ) => {
    const newFilters = { ...discoveryFilters, [key]: value };
    setDiscoveryFilters(newFilters);
  };

  const clearDiscoveryFilters = () => {
    const clearedFilters: Omit<SearchFilters, 'query'> = {
      genres: [],
      releaseYear: undefined,
      minRating: undefined,
      minVoteCount: 10,
      adult: true,
      sortBy: 'popularity',
    };
    setDiscoveryFilters(clearedFilters);
    setDiscoveryPage(1);
    updateDiscoveryURL(clearedFilters, 1);
    dispatch(discoverMovies({ 
      filters: clearedFilters, 
      page: 1 
    }));
  };

  const updateDiscoveryURL = (filters: Omit<SearchFilters, 'query'>, page: number = 1) => {
    const params = new URLSearchParams();
    
    // Support multiple genres
    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach(genre => params.append('genres', genre.toString()));
    }
    if (filters.releaseYear) params.set('releaseYear', filters.releaseYear.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.minVoteCount) params.set('minVoteCount', filters.minVoteCount.toString());
    if (filters.adult !== undefined) params.set('adult', filters.adult.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  };

  const hasActiveDiscoveryFilters = () => {
    return (discoveryFilters.genres && discoveryFilters.genres.length > 0) || 
           discoveryFilters.releaseYear || 
           discoveryFilters.minRating || 
           discoveryFilters.minVoteCount !== 10 ||
           discoveryFilters.adult !== true;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear URL params when switching tabs
    setSearchParams(new URLSearchParams());
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Find Movies
      </Typography>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab 
            icon={<SearchIcon />} 
            label="Search Movies" 
            iconPosition="start"
            sx={{ textTransform: 'none', fontSize: '1rem' }}
          />
          <Tab 
            icon={<DiscoverIcon />} 
            label="Discover Movies" 
            iconPosition="start"
            sx={{ textTransform: 'none', fontSize: '1rem' }}
          />
        </Tabs>

        {/* Text Search Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleTextSearch} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for movies by title, actor, or keyword..."
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: textQuery && (
                  <InputAdornment position="end">
                    <Button
                      type="button"
                      onClick={() => {
                        setTextQuery('');
                        setSearchParams(new URLSearchParams());
                      }}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <ClearIcon />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!textQuery.trim() || loading.isLoading}
              startIcon={loading.isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading.isLoading ? 'Searching...' : 'Search Movies'}
            </Button>
          </Box>

          {loading.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loading.error}
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Search Results for "{textQuery}"
                {pagination.totalResults > 0 && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({pagination.totalResults} results)
                  </Typography>
                )}
              </Typography>
              {loading.isLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : searchResults.length > 0 ? (
                <MovieList 
                  movies={searchResults} 
                  showLikeButtons={true}
                  showWatchlistButton={true}
                  onMovieClick={(movie) => navigate(`/movie/${movie.tmdbId}`)}
                />
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No movies found for "{textQuery}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try different keywords or check your spelling.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {searchResults.length == 0 && (
            <Box textAlign="center" py={8}>
              <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                Search for Movies
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter a movie title, actor name, or keyword to find movies.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Discovery Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Discover Movies by Filters
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  <Typography>Filters</Typography>
                  {hasActiveDiscoveryFilters() && (
                    <Chip 
                      label="Active" 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                          {/* Multi-Genre Filter */}
                          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                            <Typography gutterBottom>Genres (Select Multiple)</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflowY: 'auto', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                              {genres.filter(genre => genre.tmdbId !== undefined).map((genre) => (
                                <Chip
                                  key={genre.tmdbId}
                                  label={genre.name}
                                  onClick={() => {
                                    const currentGenres = discoveryFilters.genres || [];
                                    const genreId = genre.tmdbId!; // We know it's defined due to filter above
                                    const isSelected = currentGenres.includes(genreId);
                                    const newGenres = isSelected 
                                      ? currentGenres.filter(id => id !== genreId)
                                      : [...currentGenres, genreId];
                                    handleDiscoveryFilterChange('genres', newGenres);
                                  }}
                                  color={discoveryFilters.genres?.includes(genre.tmdbId!) ? 'primary' : 'default'}
                                  variant={discoveryFilters.genres?.includes(genre.tmdbId!) ? 'filled' : 'outlined'}
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>

                          {/* Release Year */}
                          <FormControl fullWidth>
                            <InputLabel>Release Year From</InputLabel>
                            <Select
                              value={discoveryFilters.releaseYear || ''}
                              onChange={(e) => handleDiscoveryFilterChange('releaseYear', e.target.value ? Number(e.target.value) : undefined)}
                              label="Release Year From"
                            >
                              <MenuItem value="">Any Year</MenuItem>
                              {Array.from({ length: 30 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>

                          {/* Min Rating */}
                          <FormControl fullWidth>
                            <InputLabel>Minimum Rating</InputLabel>
                            <Select
                              value={discoveryFilters.minRating || ''}
                              onChange={(e) => handleDiscoveryFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                              label="Minimum Rating"
                            >
                              <MenuItem value="">Any Rating</MenuItem>
                              <MenuItem value={1}>1+ Stars</MenuItem>
                              <MenuItem value={2}>2+ Stars</MenuItem>
                              <MenuItem value={3}>3+ Stars</MenuItem>
                              <MenuItem value={4}>4+ Stars</MenuItem>
                              <MenuItem value={5}>5+ Stars</MenuItem>
                              <MenuItem value={6}>6+ Stars</MenuItem>
                              <MenuItem value={7}>7+ Stars</MenuItem>
                              <MenuItem value={8}>8+ Stars</MenuItem>
                              <MenuItem value={9}>9+ Stars</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Min Vote Count */}
                          <FormControl fullWidth>
                            <InputLabel>Minimum Vote Count</InputLabel>
                            <Select
                              value={discoveryFilters.minVoteCount || 10}
                              onChange={(e) => handleDiscoveryFilterChange('minVoteCount', Number(e.target.value))}
                              label="Minimum Vote Count"
                            >
                              <MenuItem value={10}>10+ votes</MenuItem>
                              <MenuItem value={50}>50+ votes</MenuItem>
                              <MenuItem value={100}>100+ votes</MenuItem>
                              <MenuItem value={500}>500+ votes</MenuItem>
                              <MenuItem value={1000}>1000+ votes</MenuItem>
                              <MenuItem value={5000}>5000+ votes</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Sort By */}
                          <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                              value={discoveryFilters.sortBy || 'popularity'}
                              onChange={(e) => handleDiscoveryFilterChange('sortBy', e.target.value as any)}
                              label="Sort By"
                            >
                              <MenuItem value="popularity">Popularity</MenuItem>
                              <MenuItem value="vote_average">Rating</MenuItem>
                              <MenuItem value="release_date">Release Date</MenuItem>
                              <MenuItem value="title">Title</MenuItem>
                            </Select>
                          </FormControl>

                          {/* Adult Content Toggle */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={discoveryFilters.adult ?? true}
                                  onChange={(e) => handleDiscoveryFilterChange('adult', e.target.checked)}
                                />
                              }
                              label="Include Adult Content"
                            />
                          </Box>
                        </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleDiscoverySearch}
                    disabled={loading.isLoading}
                    startIcon={loading.isLoading ? <CircularProgress size={20} /> : <DiscoverIcon />}
                  >
                    {loading.isLoading ? 'Discovering...' : 'Discover Movies'}
                  </Button>
                  {hasActiveDiscoveryFilters() && (
                    <Button
                      variant="outlined"
                      onClick={clearDiscoveryFilters}
                      startIcon={<ClearIcon />}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {searchResults.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Discovery Results
                {pagination.totalResults > 0 && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({pagination.totalResults} results)
                  </Typography>
                )}
              </Typography>
              {loading.isLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : searchResults.length > 0 ? (
                <>
                  <MovieList 
                    movies={searchResults} 
                    showLikeButtons={true}
                    showWatchlistButton={true}
                    onMovieClick={(movie) => navigate(`/movie/${movie.tmdbId}`)}
                  />
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            const newPage = Math.max(1, discoveryPage - 1);
                            setDiscoveryPage(newPage);
                            updateDiscoveryURL(discoveryFilters, newPage);
                            dispatch(discoverMovies({ filters: discoveryFilters, page: newPage }));
                          }}
                          disabled={discoveryPage <= 1 || loading.isLoading}
                        >
                          Previous
                        </Button>
                        
                        {/* Page numbers - show max 10 pages */}
                        {Array.from({ length: Math.min(10, pagination.totalPages) }, (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={discoveryPage === pageNumber ? "contained" : "outlined"}
                              onClick={() => {
                                setDiscoveryPage(pageNumber);
                                updateDiscoveryURL(discoveryFilters, pageNumber);
                                dispatch(discoverMovies({ filters: discoveryFilters, page: pageNumber }));
                              }}
                              disabled={loading.isLoading}
                              sx={{ minWidth: 40 }}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outlined"
                          onClick={() => {
                            const newPage = Math.min(pagination.totalPages, discoveryPage + 1);
                            setDiscoveryPage(newPage);
                            updateDiscoveryURL(discoveryFilters, newPage);
                            dispatch(discoverMovies({ filters: discoveryFilters, page: newPage }));
                          }}
                          disabled={discoveryPage >= pagination.totalPages || loading.isLoading}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No movies found with these filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters to find more movies.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {searchResults.length == 0 && (
            <Box textAlign="center" py={8}>
              <DiscoverIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                Discover Movies
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Use the filters above to discover movies by genre, release date, rating, and more.
              </Typography>
            </Box>
          )}
        </TabPanel>
    </Container>
  );
};

export default SearchPage;