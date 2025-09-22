import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToLikeList, removeFromLikeList } from '../../store/slices/likeListSlice';
import { LikeStatus } from '../../types';
import { Movie } from '../../types';

interface LikeButtonProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ movie, size = 'medium', showTooltip = false }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { likeStatuses, loading } = useAppSelector((state) => state.likeList);

  const isLiked = likeStatuses[movie.tmdbId] === LikeStatus.Liked;
  const isActionLoading = loading;

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to like movies.'); // Replace with a more sophisticated notification
      return;
    }

    if (isLiked) {
      // Remove from like list
      dispatch(removeFromLikeList(movie.tmdbId));
    } else {
      // Add to like list
      dispatch(addToLikeList({ movieId: movie.tmdbId, status: LikeStatus.Liked }));
    }
  };

  const button = (
    <IconButton
      onClick={handleLikeToggle}
      size={size}
      color="inherit"
      disabled={isActionLoading}
    >
      {isActionLoading ? (
        <CircularProgress size={size === 'small' ? 20 : 24} color="inherit" />
      ) : (
        isLiked ? <Favorite color="error" /> : <FavoriteBorder />
      )}
    </IconButton>
  );

  return showTooltip ? (
    <Tooltip title={isLiked ? 'Remove from Liked' : 'Add to Liked'}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export default LikeButton;
