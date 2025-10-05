import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  TrendingUp,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchPersonalizedRecommendations } from '../../store/slices/movieSlice';
import HorizontalMovieList from '../movies/HorizontalMovieList';
import Pagination from '../ui/Pagination';
import { Movie, RecommendationStrategy } from '../../types';

interface RecommendationsSectionProps {
  onMovieClick: (movie: Movie) => void;
  onPageChange?: (page: number) => void;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  onMovieClick,
  onPageChange,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    recommendations,
    recommendationStrategy,
    recommendationMessage,
    recommendationPagination,
    currentRecommendationPage,
    loading,
  } = useAppSelector((state) => state.movies);

  const handleRefreshRecommendations = () => {
    dispatch(fetchPersonalizedRecommendations(1));
  };

  const handleGetStarted = () => {
    navigate('/search'); // Navigate to search page to start liking/disliking movies
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      dispatch(fetchPersonalizedRecommendations(page));
    }
  };

  if (loading.recommendations) {
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Recommendations for You
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (loading.error) {
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Recommendations for You
        </Typography>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefreshRecommendations}>
              Retry
            </Button>
          }
        >
          {loading.error}
        </Alert>
      </Box>
    );
  }

  if (recommendationStrategy === RecommendationStrategy.InsufficientData) {
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Recommendations for You
        </Typography>
        
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
          </Box>
          
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Get Personalized Recommendations
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: 500, mx: 'auto' }}>
            {recommendationMessage}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
            Start by liking and disliking movies to help us understand your preferences!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
              startIcon={<ThumbUp />}
            >
              Get Started
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleRefreshRecommendations}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
              startIcon={<TrendingUp />}
            >
              Refresh
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Recommendations for You
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {recommendationMessage}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          size="small"
          onClick={handleRefreshRecommendations}
          startIcon={<TrendingUp />}
        >
          Refresh
        </Button>
      </Box>

      {recommendations.length > 0 ? (
        <>
          <HorizontalMovieList
            movies={recommendations}
            showWatchlistButton={true}
            showLikeButtons={true}
            onMovieClick={onMovieClick}
          />
          {recommendationPagination.totalPages > 1 && (
            <Pagination
              currentPage={currentRecommendationPage}
              totalPages={recommendationPagination.totalPages}
              totalResults={recommendationPagination.totalResults}
              onPageChange={handlePageChange}
              disabled={loading.recommendations}
            />
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No recommendations available at the moment.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefreshRecommendations}
            startIcon={<TrendingUp />}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RecommendationsSection;
