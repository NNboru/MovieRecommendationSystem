import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchPopularMovies, fetchTopRatedMovies, fetchPersonalizedRecommendations } from '../store/slices/movieSlice';
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
    popularPagination,
    topRatedPagination,
    currentPopularPage,
    currentTopRatedPage,
  } = useAppSelector((state) => state.movies);

  const handleMovieClick = (movie: Movie) => {
    if (movie.tmdbId) {
      navigate(`/movie/${movie.tmdbId}`);
    }
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
          {loading.popular ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <HorizontalMovieList
                movies={popularMovies}
                showWatchlistButton={true}
                showLikeButtons={true}
                onMovieClick={handleMovieClick}
              />
              <Pagination
                currentPage={currentPopularPage}
                totalPages={popularPagination.totalPages}
                totalResults={popularPagination.totalResults}
                onPageChange={handlePopularPageChange}
                disabled={loading.popular}
              />
            </>
          )}
        </Box>

        {/* Top Rated Movies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
            Top Rated Movies
          </Typography>
          <MovieList
            movies={topRatedMovies}
            loading={loading.topRated}
            showWatchlistButton={true}
            showLikeButtons={true}
            onMovieClick={handleMovieClick}
          />
          <Pagination
            currentPage={currentTopRatedPage}
            totalPages={topRatedPagination.totalPages}
            totalResults={topRatedPagination.totalResults}
            onPageChange={handleTopRatedPageChange}
            disabled={loading.topRated}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

