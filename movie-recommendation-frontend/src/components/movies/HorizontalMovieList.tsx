import React, { useRef } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, Button, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, ThumbDown as ThumbDownIcon, ThumbDownOutlined as ThumbDownOutlinedIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Movie, LikeStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToLikeList, removeFromLikeList } from '../../store/slices/likeListSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
import MovieCard from './MovieCard';

interface HorizontalMovieListProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  showWatchlistButton?: boolean;
  showLikeButtons?: boolean;
}

const HorizontalMovieList: React.FC<HorizontalMovieListProps> = ({
  movies,
  onMovieClick,
  showLikeButtons = true,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { movies: watchlist } = useAppSelector((state) => state.watchlist);
  const { likeStatuses } = useAppSelector((state) => state.likeList);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((movie) => movie.tmdbId === movieId);
  };


  const handleWatchlistToggle = async (movie: Movie) => {
    if (!isAuthenticated) {
      return;
    }

    const inWatchlist = isInWatchlist(movie.tmdbId);
    
    if (inWatchlist) {
      dispatch(removeFromWatchlist(movie.tmdbId));
    } else {
      dispatch(addToWatchlist(movie.tmdbId));
    }
  };

  const handleLikeToggle = async (movie: Movie, status: LikeStatus) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const currentStatus = likeStatuses[movie.tmdbId];
      
      if (currentStatus === status) {
        // If already liked/disliked with same status, remove it
        dispatch(removeFromLikeList(movie.tmdbId));
      } else {
        // Add or update like status
        dispatch(addToLikeList({ movieId: movie.tmdbId, status }));
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320, // Scroll by card width + gap
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320, // Scroll by card width + gap
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No movies available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Left Arrow */}
      <IconButton
        onClick={scrollLeft}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: "grey.700",
            boxShadow: 4,
            width: 85,
            height: 85,
          },
          width: 80,
          height: 80,
        }}
        aria-label="Scroll left"
      >
        <ChevronLeft sx={{ fontSize: 60 }}/>
      </IconButton>

      {/* Right Arrow */}
      <IconButton
        onClick={scrollRight}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'grey.700',
            boxShadow: 4,
            width: 85,
            height: 85,
          },
          width: 80,
          height: 80,
        }}
        aria-label="Scroll right"
      >
        <ChevronRight sx={{ fontSize: 60 }}/>
      </IconButton>

      {/* Scrollable Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: 2,
          pb: 2,
          px: 1,
          // Enhanced scrollbar styles
          '&::-webkit-scrollbar': {
            height: 14,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 7,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 7,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          },
          // Firefox scrollbar styles
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)',
          // Ensure smooth scrolling
          scrollBehavior: 'smooth',
        }}
      >
      {movies.map((movie) => (
        <MovieCard
            key={movie.tmdbId}
            movie={movie}
            onMovieClick={onMovieClick}
          />
      ))}
      </Box>
    </Box>
  );
};

export default HorizontalMovieList;
