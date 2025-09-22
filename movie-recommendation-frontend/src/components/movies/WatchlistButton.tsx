import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { BookmarkAdd as BookmarkAddIcon, BookmarkAdded as BookmarkAddedIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToWatchlist, removeFromWatchlist, checkIsInWatchlist } from '../../store/slices/watchlistSlice';
import { Movie } from '../../types';

interface WatchlistButtonProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({ 
  movie, 
  size = 'medium',
  showTooltip = true 
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { movies } = useAppSelector((state) => state.watchlist);
  
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if movie is in watchlist
  useEffect(() => {
    if (isAuthenticated && movies.length > 0) {
      const movieInWatchlist = movies.some(watchlistMovie => watchlistMovie.tmdbId === movie.tmdbId);
      setIsInWatchlist(movieInWatchlist);
    } else {
      setIsInWatchlist(false);
    }
  }, [isAuthenticated, movies, movie.tmdbId]);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isInWatchlist) {
        await dispatch(removeFromWatchlist(movie.tmdbId)).unwrap();
        setIsInWatchlist(false);
      } else {
        await dispatch(addToWatchlist(movie.tmdbId)).unwrap();
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const button = (
    <IconButton
      size={size}
      onClick={handleToggleWatchlist}
      disabled={isLoading}
      color={isInWatchlist ? 'primary' : 'default'}
      sx={{
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    >
      {isLoading ? (
        <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
      ) : isInWatchlist ? (
        <BookmarkAddedIcon />
      ) : (
        <BookmarkAddIcon />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={
          isInWatchlist
            ? 'Remove from watchlist'
            : 'Add to watchlist'
        }
        arrow
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default WatchlistButton;
