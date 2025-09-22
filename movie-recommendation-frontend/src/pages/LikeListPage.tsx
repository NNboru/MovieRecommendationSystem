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
  Tabs,
  Tab,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLikeList, removeFromLikeList, clearError } from '../store/slices/likeListSlice';
import { LikeStatus } from '../types';
import { Movie } from '../types';

const LikeListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { likedMovies, dislikedMovies, loading, error } = useAppSelector((state) => state.likeList);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLikeList());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRemoveFromLikeList = async (movieId: number) => {
    dispatch(removeFromLikeList(movieId));
  };

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderMovieList = (movies: any[], title: string) => (
    <>
      <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        {title} ({movies.length})
      </Typography>
      {movies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No {title.toLowerCase()} movies yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start {title.toLowerCase()} movies by browsing our collection!
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
          {movies.map((item) => (
            <Box key={item.movie.tmdbId}>
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
                onClick={() => handleMovieClick(item.movie)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={
                    item.movie.posterPath
                      ? `https://image.tmdb.org/t/p/w500${item.movie.posterPath}`
                      : '/placeholder-movie.jpg'
                  }
                  alt={item.movie.title}
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
                    {item.movie.title}
                  </Typography>

                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : 'N/A'}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {item.movie.voteAverage && (
                      <Chip
                        label={`★ ${item.movie.voteAverage.toFixed(1)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Chip
                      label={item.status === LikeStatus.Liked ? 'Liked' : 'Disliked'}
                      size="small"
                      color={item.status === LikeStatus.Liked ? 'success' : 'error'}
                      variant="filled"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  {item.movie.genres && item.movie.genres.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {item.movie.genres.slice(0, 2).map((genre: string, index: number) => (
                        <Chip
                          key={index}
                          label={genre}
                          size="small"
                          variant="filled"
                          sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                      {item.movie.genres.length > 2 && (
                        <Chip
                          label={`+${item.movie.genres.length - 2}`}
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
                        handleMovieClick(item.movie);
                      }}
                    >
                      View Details
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromLikeList(item.movie.tmdbId);
                      }}
                      aria-label="Remove from like list"
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
    </>
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your liked and disliked movies.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Movie Preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab 
              label={`Liked Movies (${likedMovies.length})`} 
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label={`Disliked Movies (${dislikedMovies.length})`} 
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          {activeTab === 0 && renderMovieList(likedMovies, 'Liked Movies')}
          {activeTab === 1 && renderMovieList(dislikedMovies, 'Disliked Movies')}
        </Box>
      )}
    </Container>
  );
};

export default LikeListPage;
