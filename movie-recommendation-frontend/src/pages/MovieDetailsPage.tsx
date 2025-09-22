import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Star,
  StarBorder,
  PlayArrow,
  Add,
  Remove,
  Share,
  BookmarkAdd,
  BookmarkRemove,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { movieApi } from '../services/api';
import { Movie, PaginatedResponse } from '../types';
import MovieList from '../components/movies/MovieList';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const fetchRecommendationsAndSimilar = async (movieId: number) => {
    try {
      setLoadingRecommendations(true);
      setLoadingSimilar(true);

      // Fetch recommendations and similar movies in parallel
      const [recommendationsResponse, similarResponse] = await Promise.all([
        movieApi.getMovieRecommendations(movieId),
        movieApi.getSimilarMovies(movieId)
      ]);

      setRecommendations(recommendationsResponse.data || []);
      setSimilarMovies(similarResponse.data || []);
    } catch (err) {
      console.error('Error fetching recommendations and similar movies:', err);
      // Don't show error to user, just log it
    } finally {
      setLoadingRecommendations(false);
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) {
        setError('Movie ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const movieData = await movieApi.getMovieDetails(parseInt(id));
        setMovie(movieData);
        
        // Fetch recommendations and similar movies after movie details are loaded
        // Use the internal movie ID from the database
        fetchRecommendationsAndSimilar(parseInt(id));
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Implement add to watchlist functionality
    setIsInWatchlist(!isInWatchlist);
  };

  const handleShare = () => {
    if (navigator.share && movie) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Release date not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'No rating';
    return `${rating.toFixed(1)}/10`;
  };

  const formatVoteCount = (count?: number) => {
    if (!count) return 'No votes';
    return `${count.toLocaleString()} votes`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Movie not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section with Backdrop */}
      {movie.backdropPath && (
        <Box
          sx={{
            position: 'relative',
            height: '60vh',
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
            },
          }}
        >
          <Container maxWidth={false} sx={{ position: 'relative', height: '100%' }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                pb: 4,
              }}
            >
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={handleBackClick}
                sx={{ mb: 2 }}
              >
                Back
              </Button>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {movie.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 2,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <span style={{ fontStyle: 'italic' }}>"{movie.originalTitle}"</span>
                )}
              </Typography>
            </Box>
          </Container>
        </Box>
      )}

      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 2fr', md: '1fr 2fr' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          {/* Movie Poster */}
          <Box>
            <Card
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
              }}
            >
              {movie.posterPath ? (
                <CardMedia
                  component="img"
                  image={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                  alt={movie.title}
                  sx={{ aspectRatio: '2/3' }}
                />
              ) : (
                <Box
                  sx={{
                    aspectRatio: '2/3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.800',
                    color: 'grey.400',
                  }}
                >
                  <Typography variant="h6">No Image</Typography>
                </Box>
              )}
            </Card>
          </Box>

          {/* Movie Details */}
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating
                  value={(movie.voteAverage || 0) / 2}
                  precision={0.1}
                  readOnly
                  size="large"
                />
                <Typography variant="h6" color="text.secondary">
                  {formatRating(movie.voteAverage)} ({formatVoteCount(movie.voteCount)})
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                {movie.overview || 'No description available.'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {movie.genres.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Release Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(movie.releaseDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="body2">
                    {movie.originalLanguage?.toUpperCase() || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Popularity
                  </Typography>
                  <Typography variant="body2">
                    {movie.popularity?.toFixed(0) || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Adult Content
                  </Typography>
                  <Typography variant="body2">
                    {movie.isAdult ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  size="large"
                  sx={{ minWidth: 140 }}
                >
                  Watch Trailer
                </Button>

                <Button
                  variant={isInWatchlist ? "outlined" : "contained"}
                  startIcon={isInWatchlist ? <BookmarkRemove /> : <BookmarkAdd />}
                  onClick={handleAddToWatchlist}
                  size="large"
                  sx={{ minWidth: 140 }}
                >
                  {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>

                <Tooltip title="Share">
                  <IconButton onClick={handleShare} size="large">
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Additional Sections */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            More Information
          </Typography>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Movie Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    TMDB ID:
                  </Typography>
                  <Typography variant="body2">
                    {movie.tmdbId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Added to Database:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(movie.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recommendations Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Recommendations
          </Typography>
          {loadingRecommendations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recommendations.length > 0 ? (
            <MovieList
              movies={recommendations}
              showWatchlistButton={true}
              showLikeButtons={true}
              onMovieClick={(movie) => navigate(`/movie/${movie.tmdbId}`)}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No recommendations available for this movie.
            </Typography>
          )}
        </Box>

        {/* Similar Movies Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Similar Movies
          </Typography>
          {loadingSimilar ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : similarMovies.length > 0 ? (
            <MovieList
              movies={similarMovies}
              showWatchlistButton={true}
              showLikeButtons={true}
              onMovieClick={(movie) => navigate(`/movie/${movie.tmdbId}`)}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No similar movies available for this movie.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MovieDetailsPage;

