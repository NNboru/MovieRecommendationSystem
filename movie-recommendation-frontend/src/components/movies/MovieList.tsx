import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Movie, MovieListProps } from '../../types';
import MovieCard from './MovieCard';

const MovieList: React.FC<MovieListProps> = ({
  movies,
  title,
  loading = false,
  onMovieClick,
  showWatchlistButton = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollEvent);
      return () => container.removeEventListener('scroll', handleScrollEvent);
    }
  }, []);

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

  // For mobile, show in a grid
  if (isMobile) {
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 2,
          }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={onMovieClick}
              showWatchlistButton={showWatchlistButton}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // For desktop, show in horizontal scroll
  return (
    <Box>
      {title && (
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ position: 'relative' }}>
        {/* Left scroll button */}
        {scrollPosition > 0 && (
          <IconButton
            onClick={() => handleScroll('left')}
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
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {/* Right scroll button */}
        <IconButton
          onClick={() => handleScroll('right')}
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
            },
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Movie cards container */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.5)',
              },
            },
          }}
        >
          {movies.map((movie) => (
            <Box
              key={movie.id}
              sx={{
                minWidth: isTablet ? 200 : 250,
                flexShrink: 0,
              }}
            >
              <MovieCard
                movie={movie}
                onMovieClick={onMovieClick}
                showWatchlistButton={showWatchlistButton}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MovieList;
