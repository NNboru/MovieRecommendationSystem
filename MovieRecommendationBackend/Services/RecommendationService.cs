using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Services;

public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _context;
    private readonly ITMDBService _tmdbService;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(
        ApplicationDbContext context,
        ITMDBService tmdbService,
        ILogger<RecommendationService> logger)
    {
        _context = context;
        _tmdbService = tmdbService;
        _logger = logger;
    }

    public async Task<RecommendationResult> GetPersonalizedRecommendations(int userId, int page = 1)
    {
        try
        {
            // Analyze user data to determine strategy
            var userData = await AnalyzeUserData(userId);

            if (userData.Strategy == RecommendationStrategy.InsufficientData)
            {
                return new RecommendationResult
                {
                    Strategy = RecommendationStrategy.InsufficientData,
                    Message = "Like and dislike some movies to get personalized recommendations!",
                    Movies = new List<MovieDto>(),
                    Page = page,
                    TotalPages = 1,
                    TotalResults = 0
                };
            }

            // Use advanced approach for users with 2+ likes
            var recommendations = await GetAdvancedRecommendations(userId, page);

            return new RecommendationResult
            {
                Strategy = RecommendationStrategy.Advanced,
                Message = "Based on your preferences",
                Movies = recommendations.Movies,
                Page = recommendations.Page,
                TotalPages = recommendations.TotalPages,
                TotalResults = recommendations.TotalResults
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting personalized recommendations for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserRecommendationData> AnalyzeUserData(int userId)
    {
        var likedMovies = await GetUserLikedMovies(userId);
        var dislikedMovies = await GetUserDislikedMovies(userId);

        var strategy = likedMovies.Count >= 2 
            ? RecommendationStrategy.Advanced 
            : RecommendationStrategy.InsufficientData;

        return new UserRecommendationData
        {
            LikedCount = likedMovies.Count,
            DislikedCount = dislikedMovies.Count,
            Strategy = strategy,
            LikedMovies = likedMovies,
            DislikedMovies = dislikedMovies
        };
    }

    // Main recommendation generation method
    private async Task<DiscoverMoviesResult> GetAdvancedRecommendations(int userId, int page)
    {
        // Build comprehensive user profile
        var userProfile = await BuildAdvancedUserProfile(userId);

        // Generate candidate movies using TMDB discover
        var candidateMoviesObj = await GenerateCandidateMovies(userProfile, page);

        // Apply advanced scoring algorithm
        var scoredMovies = ScoreMoviesWithAdvancedAlgorithm(candidateMoviesObj.Movies, userProfile);

        // Filter and rank results
        var finalRecommendations = FilterAndRankRecommendations(scoredMovies, userProfile);

        return new DiscoverMoviesResult
        {
            Movies = finalRecommendations,
            Page = page,
            TotalPages = candidateMoviesObj.TotalPages, // Simplified for now
            TotalResults = candidateMoviesObj.TotalResults
        };
    }

    private async Task<UserProfile> BuildAdvancedUserProfile(int userId)
    {
        var likedMovies = await GetUserLikedMovies(userId);
        var dislikedMovies = await GetUserDislikedMovies(userId);

        var profile = new UserProfile();

        // Analyze genre preferences from liked movies
        profile.GenreWeights = CalculateDetailedGenreWeights(likedMovies);

        // Analyze year preferences
        profile.YearPreferences = CalculateYearPreferences(likedMovies, dislikedMovies);

        // Analyze rating preferences
        profile.RatingPreferences = CalculateRatingPreferences(likedMovies);

        // Build avoidance patterns
        profile.AvoidedMovieIds = dislikedMovies.Select(m => m.TMDBId).ToList();

        return profile;
    }

    private Dictionary<int, double> CalculateDetailedGenreWeights(List<MovieDto> likedMovies)
    {
        var genreCounts = new Dictionary<int, int>();
        var genreRatings = new Dictionary<int, List<double>>();

        foreach (var movie in likedMovies)
        {
            var movieGenres = GetMovieGenreIds(movie);

            foreach (var genreId in movieGenres)
            {
                if (!genreCounts.ContainsKey(genreId))
                {
                    genreCounts[genreId] = 0;
                    genreRatings[genreId] = new List<double>();
                }

                genreCounts[genreId]++;
                genreRatings[genreId].Add(movie.VoteAverage ?? 0);
            }
        }

        // Calculate weighted scores
        var genreWeights = new Dictionary<int, double>();
        var totalMovies = likedMovies.Count;

        if (totalMovies == 0) return genreWeights;

        foreach (var genre in genreCounts.Keys)
        {
            var frequency = (double)genreCounts[genre] / totalMovies;
            var avgRating = genreRatings[genre].Average();
            var weight = frequency * (avgRating / 10.0); // Normalize rating

            genreWeights[genre] = weight;
        }

        // Normalize weights to 0-1 range
        if (genreWeights.Any())
        {
            var maxWeight = genreWeights.Values.Max();
            return genreWeights.ToDictionary(kv => kv.Key, kv => kv.Value / maxWeight);
        }

        return genreWeights;
    }

    private Dictionary<int, double> CalculateAvoidedGenres(List<MovieDto> dislikedMovies)
    {
        var genreCounts = new Dictionary<int, int>();

        foreach (var movie in dislikedMovies)
        {
            var movieGenres = GetMovieGenreIds(movie);

            foreach (var genreId in movieGenres)
            {
                if (!genreCounts.ContainsKey(genreId))
                {
                    genreCounts[genreId] = 0;
                }

                genreCounts[genreId]++;
            }
        }

        // Calculate avoidance weights
        var totalMovies = dislikedMovies.Count;
        if (totalMovies == 0) return new Dictionary<int, double>();

        return genreCounts.ToDictionary(
            kv => kv.Key,
            kv => (double)kv.Value / totalMovies
        );
    }

    private static YearPreference CalculateYearPreferences(List<MovieDto> likedMovies, List<MovieDto> dislikedMovies)
    {
        if (!likedMovies.Any())
        {
            return new YearPreference
            {
                PreferredStartYear = 2000,
                PreferredEndYear = DateTime.Now.Year
            };
        }

        var likedYears = likedMovies
            .Where(m => !string.IsNullOrEmpty(m.ReleaseDate))
            .Select(m => ExtractYear(m.ReleaseDate!))
            .Where(year => year > 0)
            .ToList();

        var dislikedYears = dislikedMovies
            .Where(m => !string.IsNullOrEmpty(m.ReleaseDate))
            .Select(m => ExtractYear(m.ReleaseDate!))
            .Where(year => year > 0)
            .ToList();

        if (!likedYears.Any())
        {
            return new YearPreference
            {
                PreferredStartYear = 2000,
                PreferredEndYear = DateTime.Now.Year
            };
        }

        var avgLikedYear = likedYears.Average();
        var yearRange = Math.Max(5, likedYears.Max() - likedYears.Min());

        return new YearPreference
        {
            PreferredStartYear = Math.Max(1900, (int)(avgLikedYear - yearRange / 2)),
            PreferredEndYear = Math.Min(DateTime.Now.Year, (int)(avgLikedYear + yearRange / 2))
        };
    }

    private static RatingPreference CalculateRatingPreferences(List<MovieDto> likedMovies)
    {
        var likedRatings = likedMovies
            .Where(m => m.VoteAverage.HasValue)
            .Select(m => m.VoteAverage!.Value)
            .ToList();

        var minLikedRating = likedRatings.Min();

        return new RatingPreference
        {
            MinRating = Math.Max(5.0, minLikedRating - 1.0),
            PreferredRating = 10
        };
    }

    private async Task<DiscoverMoviesResult> GenerateCandidateMovies(UserProfile profile, int page)
    {
        // Get top preferred genres
        var topGenres = profile.GenreWeights
            .OrderByDescending(kv => kv.Value)
            .Take(2)
            .Select(kv => kv.Key)
            .ToList();

        if (!topGenres.Any())
        {
            // Fallback to popular movies if no genre preferences
            var popularResult = await _tmdbService.GetPopularMoviesAsync(page);
            return popularResult;
        }

        // Build discover request with user preferences
        var discoverRequest = new DiscoverMoviesRequest
        {
            Genres = [topGenres[0]],
            ReleaseDateFrom = $"{profile.YearPreferences.PreferredStartYear}-01-01",
            MinRating = profile.RatingPreferences.MinRating,
            MinVoteCount = 100,
            SortBy = "vote_average",
            Page = page
        };

        var result_page1 = await _tmdbService.DiscoverMoviesAsync(discoverRequest);
        discoverRequest.Genres = [topGenres[0]];
        var result_page2 = await _tmdbService.DiscoverMoviesAsync(discoverRequest);
        // Combine results from both pages
        var combinedMovies = result_page1.Movies.Join(result_page2.Movies, i => i.TMDBId, i => i.TMDBId, (i,j) => i).ToList();

        return new DiscoverMoviesResult
        {
            Movies = combinedMovies,
            Page = page,
            TotalPages = result_page1.TotalPages,
            TotalResults = result_page1.TotalResults
        };
    }

    private List<ScoredMovie> ScoreMoviesWithAdvancedAlgorithm(List<MovieDto> movies, UserProfile profile)
    {
        var scoredMovies = new List<ScoredMovie>();

        foreach (var movie in movies)
        {
            var score = 0.0;

            // Genre matching score (40% weight)
            var genreScore = CalculateGenreScore(movie, profile.GenreWeights, profile.AvoidedGenres);
            score += genreScore * 0.4;

            // Year preference score (20% weight)
            var yearScore = CalculateYearScore(movie, profile.YearPreferences);
            score += yearScore * 0.1;

            // Rating preference score (20% weight)
            var ratingScore = CalculateRatingScore(movie, profile.RatingPreferences);
            score += ratingScore * 0.4;

            // Popularity score (10% weight)
            var popularityScore = CalculatePopularityScore(movie);
            score += popularityScore * 0.1;

            scoredMovies.Add(new ScoredMovie
            {
                Movie = movie,
                Score = Math.Max(0, score),
                GenreScore = genreScore,
                YearScore = yearScore,
                RatingScore = ratingScore
            });
        }

        return scoredMovies;
    }

    private double CalculateGenreScore(MovieDto movie, Dictionary<int, double> genreWeights, Dictionary<int, double> avoidedGenres)
    {
        var movieGenres = GetMovieGenreIds(movie);
        var score = 0.0;

        foreach (var genreId in movieGenres)
        {
            if (genreWeights.ContainsKey(genreId))
            {
                score += genreWeights[genreId];
            }

            if (avoidedGenres.ContainsKey(genreId))
            {
                score -= avoidedGenres[genreId] * 2; // Heavy penalty for avoided genres
            }
        }

        return score;
    }

    private static double CalculateYearScore(MovieDto movie, YearPreference yearPrefs)
    {
        if (string.IsNullOrEmpty(movie.ReleaseDate)) return 0.5;

        var releaseYear = ExtractYear(movie.ReleaseDate);

        if (releaseYear >= yearPrefs.PreferredStartYear)
        {
            return 1.0;
        }

        var distance = Math.Abs(releaseYear - yearPrefs.PreferredStartYear);
        return Math.Max(0, 1.0 - (distance / 10.0));
    }

    private static double CalculateRatingScore(MovieDto movie, RatingPreference ratingPrefs)
    {
        var movieRating = movie.VoteAverage ?? 0;

        if (movieRating < ratingPrefs.MinRating)
        {
            return 0.0;
        }

        var distance = Math.Abs(movieRating - ratingPrefs.PreferredRating);
        return Math.Max(0, 1.0 - (distance / 5.0));
    }

    private static double CalculatePopularityScore(MovieDto movie)
    {
        var popularity = movie.Popularity ?? 0;
        return Math.Min(1.0, popularity / 1000.0); // Normalize popularity
    }

    private static List<MovieDto> FilterAndRankRecommendations(List<ScoredMovie> scoredMovies, UserProfile profile)
    {
        return scoredMovies
            .Where(sm => sm.Score > 0.2)
            .Where(sm => !profile.AvoidedMovieIds.Contains(sm.Movie.TMDBId))
            .OrderByDescending(sm => sm.Score)
            .ThenByDescending(sm => sm.Movie.VoteAverage ?? 0)
            .Select(sm => sm.Movie)
            .ToList();
    }

    // Helper methods
    private async Task<List<MovieDto>> GetUserLikedMovies(int userId)
    {
        var likedMovies = await _context.LikeLists
            .Where(l => l.UserId == userId && l.Status == LikeStatus.Liked)
            .Include(l => l.Movie)
            .ThenInclude(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Select(l => MapToMovieDto(l.Movie))
            .ToListAsync();

        return likedMovies;
    }

    private async Task<List<MovieDto>> GetUserDislikedMovies(int userId)
    {
        var dislikedMovies = await _context.LikeLists
            .Where(l => l.UserId == userId && l.Status == LikeStatus.Disliked)
            .Include(l => l.Movie)
            .ThenInclude(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Select(l => MapToMovieDto(l.Movie))
            .ToListAsync();

        return dislikedMovies;
    }

    private List<int> GetMovieGenreIds(MovieDto movie)
    {
        if (movie.Genres == null || !movie.Genres.Any())
            return new List<int>();

        // Map genre names to TMDB genre IDs using _context.Genres
        var genreIds = _context.Genres
            .Where(g => movie.Genres.Contains(g.Name))
            .Select(g => g.TMDBId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList();

        return genreIds;
    }

    private static int ExtractYear(string releaseDate)
    {
        if (DateTime.TryParse(releaseDate, out var date))
        {
            return date.Year;
        }
        return 0;
    }

    private static MovieDto MapToMovieDto(Movie movie)
    {
        return new MovieDto
        {
            Id = movie.Id,
            TMDBId = movie.TMDBId,
            Title = movie.Title,
            Overview = movie.Overview,
            ReleaseDate = movie.ReleaseDate,
            VoteAverage = movie.VoteAverage,
            VoteCount = movie.VoteCount,
            PosterPath = movie.PosterPath,
            BackdropPath = movie.BackdropPath,
            IsAdult = movie.IsAdult,
            OriginalLanguage = movie.OriginalLanguage,
            OriginalTitle = movie.OriginalTitle,
            Popularity = movie.Popularity,
            Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
            CreatedAt = movie.CreatedAt,
            UpdatedAt = movie.UpdatedAt
        };
    }
}
