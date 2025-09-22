import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWatchlist, removeFromWatchlist, clearError } from '../store/slices/watchlistSlice';
import { Movie } from '../types';

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movies, loading } = useAppSelector((state) => state.watchlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWatchlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRemoveFromWatchlist = async (movieId: number) => {
    dispatch(removeFromWatchlist(movieId));
  };

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your watchlist.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Watchlist ({movies.length})
        </Typography>
      </Box>

      {loading.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loading.error}
        </Alert>
      )}

      {loading.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : movies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Your watchlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start adding movies to your watchlist by browsing our collection!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Browse Movies
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)', // 2 columns on mobile (portrait)
              sm: 'repeat(3, 1fr)', // 3 columns on small screens
              md: 'repeat(4, 1fr)', // 4 columns on medium screens
              lg: 'repeat(5, 1fr)', // 5 columns on large screens
              xl: 'repeat(6, 1fr)', // 6 columns on extra large screens
            },
            gap: 3,
          }}
        >
          {movies.map((movie) => (
            <Box key={movie.tmdbId}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleMovieClick(movie)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={
                    movie.posterPath
                      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                      : '/placeholder-movie.jpg'
                  }
                  alt={movie.title}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: 'grey.300',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {movie.title}
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {movie.voteAverage && (
                      <Chip
                        label={`★ ${movie.voteAverage.toFixed(1)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>

                  {movie.genres && movie.genres.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {movie.genres.slice(0, 2).map((genre, index) => (
                        <Chip
                          key={index}
                          label={genre}
                          size="small"
                          variant="filled"
                          sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                      {movie.genres.length > 2 && (
                        <Chip
                          label={`+${movie.genres.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovieClick(movie);
                      }}
                    >
                      View Details
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWatchlist(movie.tmdbId);
                      }}
                      aria-label="Remove from watchlist"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default WatchlistPage;