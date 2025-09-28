import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { ThumbDown, ThumbDownOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToLikeList, removeFromLikeList } from '../../store/slices/likeListSlice';
import { LikeStatus } from '../../types';
import { Movie } from '../../types';

interface DislikeButtonProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const DislikeButton: React.FC<DislikeButtonProps> = ({ movie, size = 'medium', showTooltip = false }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { likeStatuses, loadingMovies } = useAppSelector((state) => state.likeList);

  const isDisliked = likeStatuses[movie.tmdbId] === LikeStatus.Disliked;
  const isActionLoading = loadingMovies[movie.tmdbId] || false;

  const handleDislikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to dislike movies.'); // Replace with a more sophisticated notification
      return;
    }

    if (isDisliked) {
      // Remove from dislike list
      dispatch(removeFromLikeList(movie.tmdbId));
    } else {
      // Add to dislike list
      dispatch(addToLikeList({ movieId: movie.tmdbId, status: LikeStatus.Disliked }));
    }
  };

  const button = (
    <IconButton
      onClick={handleDislikeToggle}
      size={size}
      disabled={isActionLoading}
      sx={{
        color: isDisliked ? 'red' : 'inherit',
        '&:hover': {
          color: 'red',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
        },
      }}
    >
      {isActionLoading ? (
        <CircularProgress size={size === 'small' ? 20 : 24} color="inherit" />
      ) : (
        isDisliked ? <ThumbDown /> : <ThumbDownOutlined />
      )}
    </IconButton>
  );

  return showTooltip ? (
    <Tooltip title={isDisliked ? 'Remove from Disliked' : 'Add to Disliked'}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export default DislikeButton;
