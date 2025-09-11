import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Movie, MovieListProps } from '../../types';
import MovieCard from './MovieCard';

const MovieList: React.FC<MovieListProps> = ({
  movies,
  title,
  loading = false,
  onMovieClick,
  showWatchlistButton = false,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No movies found.
      </Alert>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
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
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          width: '100%',
        }}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.tmdbId}
            movie={movie}
            onMovieClick={onMovieClick}
            showWatchlistButton={showWatchlistButton}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MovieList;
