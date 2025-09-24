import React, { useRef, useState, useEffect } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Chip, Button, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, ThumbDown as ThumbDownIcon, ThumbDownOutlined as ThumbDownOutlinedIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Movie, LikeStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { likeListApi } from '../../services/api';
import { addToLikeList, removeFromLikeList } from '../../store/slices/likeListSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/watchlistSlice';
import { checkLikeStatus } from '../../store/slices/likeListSlice';

interface HorizontalMovieListProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  showWatchlistButton?: boolean;
  showLikeButtons?: boolean;
}

const HorizontalMovieList: React.FC<HorizontalMovieListProps> = ({
  movies,
  onMovieClick,
  showWatchlistButton = true,
  showLikeButtons = true,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { movies: watchlist } = useAppSelector((state) => state.watchlist);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [likeStatuses, setLikeStatuses] = useState<Record<number, LikeStatus | null>>({});

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((movie) => movie.tmdbId === movieId);
  };

  // Fetch like statuses for all movies
  useEffect(() => {
    if (isAuthenticated && movies.length > 0) {
      const fetchLikeStatuses = async () => {
        const statusPromises = movies.map(async (movie) => {
          try {
            const response = await likeListApi.checkLikeStatus(movie.tmdbId);
            return { movieId: movie.tmdbId, status: response.status };
          } catch (error) {
            return { movieId: movie.tmdbId, status: null };
          }
        });
        
        const results = await Promise.all(statusPromises);
        const statusMap: Record<number, LikeStatus | null> = {};
        results.forEach(({ movieId, status }) => {
          statusMap[movieId] = status === '1' ? LikeStatus.Liked : status === '2' ? LikeStatus.Disliked : null;
        });
        setLikeStatuses(statusMap);
      };
      
      fetchLikeStatuses();
    }
  }, [isAuthenticated, movies]);

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
        setLikeStatuses(prev => ({ ...prev, [movie.tmdbId]: null }));
      } else {
        // Add or update like status
        dispatch(addToLikeList({ movieId: movie.tmdbId, status }));
        setLikeStatuses(prev => ({ ...prev, [movie.tmdbId]: status }));
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
            backgroundColor: 'background.paper',
            boxShadow: 4,
          },
          width: 40,
          height: 40,
        }}
        aria-label="Scroll left"
      >
        <ChevronLeft />
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
            backgroundColor: 'background.paper',
            boxShadow: 4,
          },
          width: 40,
          height: 40,
        }}
        aria-label="Scroll right"
      >
        <ChevronRight />
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
        <Box
          key={movie.tmdbId}
          sx={{
            minWidth: 280,
            maxWidth: 280,
            flexShrink: 0,
          }}
        >
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => onMovieClick(movie)}
          >
            <CardMedia
              component="img"
              height="400"
              image={
                movie.posterPath
                  ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                  : '/placeholder-movie.jpg'
              }
              alt={movie.title}
              sx={{
                objectFit: 'cover',
                backgroundColor: 'grey.300',
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {movie.title}
              </Typography>

              <Box sx={{ mb: 1 }}>
                <Chip
                  label={movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
                {movie.voteAverage && (
                  <Chip
                    label={`★ ${movie.voteAverage.toFixed(1)}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>

              {movie.genres && movie.genres.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {movie.genres.slice(0, 2).map((genre: string, index: number) => (
                    <Chip
                      key={index}
                      label={genre}
                      size="small"
                      variant="filled"
                      sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                    />
                  ))}
                  {movie.genres.length > 2 && (
                    <Chip
                      label={`+${movie.genres.length - 2}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovieClick(movie);
                  }}
                >
                  View
                </Button>
                
                {isAuthenticated && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {showLikeButtons && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(movie, LikeStatus.Liked);
                          }}
                          aria-label="Like movie"
                          sx={{
                            color: likeStatuses[movie.tmdbId] === LikeStatus.Liked ? 'green' : 'inherit',
                            '&:hover': {
                              color: 'green',
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            },
                          }}
                        >
                          {likeStatuses[movie.tmdbId] === LikeStatus.Liked ? (
                            <FavoriteIcon fontSize="small" />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(movie, LikeStatus.Disliked);
                          }}
                          aria-label="Dislike movie"
                          sx={{
                            color: likeStatuses[movie.tmdbId] === LikeStatus.Disliked ? 'red' : 'inherit',
                            '&:hover': {
                              color: 'red',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          {likeStatuses[movie.tmdbId] === LikeStatus.Disliked ? (
                            <ThumbDownIcon fontSize="small" />
                          ) : (
                            <ThumbDownOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
      </Box>
    </Box>
  );
};

export default HorizontalMovieList;
