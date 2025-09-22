import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Info,
  Star,
  CalendarToday,
  Language,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../../types';

interface HeroSectionProps {
  movies: Movie[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ movies }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMovieIndex((prevIndex) => 
        (prevIndex + 1) % movies.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) {
    return null;
  }

  const currentMovie = movies[currentMovieIndex];

  const handleMovieClick = () => {
    navigate(`/movie/${currentMovie.tmdbId}`);
  };

  const handleAddToWatchlist = () => {
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: isMobile ? '60vh' : '80vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: currentMovie.backdropPath
            ? `url(https://image.tmdb.org/t/p/original${currentMovie.backdropPath})`
            : 'linear-gradient(45deg, #1976d2, #dc004e)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
          },
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          width: '100%',
          px: 3,
          py: 4,
        }}
      >
        <Box sx={{ maxWidth: isMobile ? '100%' : '60%' }}>
          {/* Movie Title */}
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              lineHeight: 1.2,
            }}
          >
            {currentMovie.title}
          </Typography>

          {/* Movie Info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {currentMovie.releaseDate && (
              <Chip
                icon={<CalendarToday />}
                label={new Date(currentMovie.releaseDate).getFullYear()}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
            {currentMovie.originalLanguage && (
              <Chip
                icon={<Language />}
                label={currentMovie.originalLanguage.toUpperCase()}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
            {currentMovie.voteAverage && (
              <Chip
                icon={<Star />}
                label={`${currentMovie.voteAverage.toFixed(1)}/10`}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
          </Box>

          {/* Movie Overview */}
          {currentMovie.overview && (
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 3 : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {currentMovie.overview}
            </Typography>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleMovieClick}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Watch Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Add />}
              onClick={handleAddToWatchlist}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Add to Watchlist
            </Button>
            <IconButton
              size="large"
              onClick={handleMovieClick}
              sx={{
                color: 'white',
                border: '2px solid white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Info />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Movie Indicators */}
      {movies.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2,
          }}
        >
          {movies.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentMovieIndex(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentMovieIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HeroSection;
