import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow,
  Info,
  Star,
  CalendarToday,
} from '@mui/icons-material';
import { Movie, MovieCardProps } from '../../types';
import WatchlistButton from './WatchlistButton';
import LikeButton from './LikeButton';
import DislikeButton from './DislikeButton';

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onMovieClick,
  showWatchlistButton = true,
  showLikeButtons = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
  };


  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const getPosterUrl = () => {
    if (imageError || !movie.posterPath) {
      return '/api/placeholder/300/450';
    }
    return `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        maxWidth: 280,
        flexShrink: 0,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={handleCardClick}
    >
      {/* Movie Poster */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={isMobile ? 300 : 400}
          image={getPosterUrl()}
          alt={movie.title}
          onError={() => setImageError(true)}
          sx={{
            objectFit: 'cover',
          }}
        />
        
        {/* Overlay on hover */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <IconButton
            size="large"
            onClick={handlePlayClick}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <PlayArrow fontSize="large" />
          </IconButton>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {showWatchlistButton && (
            <Box
              sx={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
              }}
            >
              <WatchlistButton movie={movie} size="small" showTooltip={true} />
            </Box>
          )}
          
          {showLikeButtons && (
            <>
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                }}
              >
                <LikeButton movie={movie} size="small" showTooltip={true} />
              </Box>
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                }}
              >
                <DislikeButton movie={movie} size="small" showTooltip={true} />
              </Box>
            </>
          )}
        </Box>

        {/* Rating Badge */}
        {movie.voteAverage && movie.voteAverage > 0 && (
          <Chip
            icon={<Star />}
            label={movie.voteAverage.toFixed(1)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>

      {/* Movie Info */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
        >
          {movie.title}
        </Typography>

        {/* Release Date */}
        {movie.releaseDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(movie.releaseDate)}
            </Typography>
          </Box>
        )}

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {movie.genres.slice(0, 2).map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {movie.genres.length > 2 && (
              <Chip
                label={`+${movie.genres.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        )}

        {/* Overview */}
        {movie.overview && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {movie.overview}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={handleCardClick}
            sx={{ ml: 'auto' }}
          >
            <Info />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default MovieCard;
