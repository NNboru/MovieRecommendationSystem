import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchTrendingMovies, fetchPopularMovies, fetchTopRatedMovies, fetchPersonalizedRecommendations } from '../store/slices/movieSlice';
import MovieList from '../components/movies/MovieList';
import HorizontalMovieList from '../components/movies/HorizontalMovieList';
import HeroSection from '../components/home/HeroSection';
import RecommendationsSection from '../components/recommendations/RecommendationsSection';
import Pagination from '../components/ui/Pagination';
import { Movie } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    trendingMovies,
    popularMovies,
    topRatedMovies,
    loading,
    trendingPagination,
    popularPagination,
    topRatedPagination,
    currentTrendingPage,
    currentPopularPage,
    currentTopRatedPage,
  } = useAppSelector((state) => state.movies);

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
  };

  const handleTrendingPageChange = (page: number) => {
    dispatch(fetchTrendingMovies(page));
  };

  const handlePopularPageChange = (page: number) => {
    dispatch(fetchPopularMovies(page));
  };

  const handleTopRatedPageChange = (page: number) => {
    dispatch(fetchTopRatedMovies(page));
  };

  const handleRecommendationPageChange = (page: number) => {
    dispatch(fetchPersonalizedRecommendations(page));
  };

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
            Currently in Theatres
          </Typography>
          <Pagination
            currentPage={currentTrendingPage}
            totalPages={trendingPagination.totalPages}
            totalResults={trendingPagination.totalResults}
            onPageChange={handleTrendingPageChange}
            disabled={loading.trending}
          />
          {loading.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loading.error}
            </Alert>
          ) : loading.trending ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, height: 400 }}>
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

        {/* Recommendations for You */}
        <RecommendationsSection 
          onMovieClick={handleMovieClick} 
          onPageChange={handleRecommendationPageChange}
        />

        {/* Popular Movies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Popular Movies
          </Typography>
          <Pagination
            currentPage={currentPopularPage}
            totalPages={popularPagination.totalPages}
            totalResults={popularPagination.totalResults}
            onPageChange={handlePopularPageChange}
            disabled={loading.popular}
          />
          {loading.popular ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, height: 400 }}>
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
          <Pagination
            currentPage={currentTopRatedPage}
            totalPages={topRatedPagination.totalPages}
            totalResults={topRatedPagination.totalResults}
            onPageChange={handleTopRatedPageChange}
            disabled={loading.topRated}
          />
          {loading.topRated ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, height: 400 }}>
              <CircularProgress sx={{ height: 300 }} />
            </Box>
          ) : <HorizontalMovieList
            movies={topRatedMovies}
            showWatchlistButton={true}
            showLikeButtons={true}
            onMovieClick={handleMovieClick}
          />}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

