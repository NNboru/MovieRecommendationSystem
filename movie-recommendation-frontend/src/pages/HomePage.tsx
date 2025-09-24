import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
} from '../store/slices/movieSlice';
import MovieList from '../components/movies/MovieList';
import HorizontalMovieList from '../components/movies/HorizontalMovieList';
import HeroSection from '../components/home/HeroSection';
import { Movie } from '../types';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    trendingMovies,
    popularMovies,
    topRatedMovies,
    loading,
  } = useAppSelector((state) => state.movies);

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
  };

  useEffect(() => {
    // Fetch all movie categories on component mount
    dispatch(fetchTrendingMovies(1));
    dispatch(fetchPopularMovies(1));
    dispatch(fetchTopRatedMovies(1));
  }, [dispatch]);

  if (loading.isLoading && !trendingMovies.length) {
    return (
      <Container maxWidth={false} sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading movies...
        </Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection movies={trendingMovies.slice(0, 5)} />

      <Container sx={{ py: 4 }} maxWidth={false}>
        {/* Trending Movies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Trending This Week
          </Typography>
          {loading.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loading.error}
            </Alert>
          ) : loading.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <HorizontalMovieList
              movies={trendingMovies}
              showWatchlistButton={true}
              showLikeButtons={true}
              onMovieClick={handleMovieClick}
            />
          )}
        </Box>

        {/* Popular Movies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Popular Movies
          </Typography>
          {loading.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <HorizontalMovieList
              movies={popularMovies}
              showWatchlistButton={true}
              showLikeButtons={true}
              onMovieClick={handleMovieClick}
            />
          )}
        </Box>

        {/* Top Rated Movies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Top Rated Movies
          </Typography>
          <MovieList
            movies={topRatedMovies}
            loading={loading.isLoading}
            showWatchlistButton={true}
            showLikeButtons={true}
            onMovieClick={handleMovieClick}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

