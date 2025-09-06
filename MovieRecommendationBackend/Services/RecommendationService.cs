using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Services;

public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _context;
    private readonly ITMDBService _tmdbService;

    public RecommendationService(ApplicationDbContext context, ITMDBService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<List<MovieDto>> GetPersonalizedRecommendationsAsync(int userId, int limit = 10)
    {
        // Get user's rating history
        var userRatings = await _context.Ratings
            .Where(r => r.UserId == userId)
            .Include(r => r.Movie)
            .ThenInclude(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .ToListAsync();

        if (!userRatings.Any())
        {
            // If user has no ratings, return popular movies
            return await _tmdbService.GetPopularMoviesAsync(1);
        }

        // Get user's preferred genres based on ratings
        var userGenrePreferences = userRatings
            .SelectMany(r => r.Movie.MovieGenres)
            .GroupBy(mg => mg.Genre.Name)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(3)
            .ToList();

        // Get movies in preferred genres that user hasn't rated
        var recommendedMovies = await _context.Movies
            .Where(m => m.MovieGenres.Any(mg => userGenrePreferences.Contains(mg.Genre.Name)))
            .Where(m => !m.Ratings.Any(r => r.UserId == userId))
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .OrderByDescending(m => m.VoteAverage)
            .Take(limit)
            .ToListAsync();

        return recommendedMovies.Select(MapToMovieDto).ToList();
    }

    public async Task<List<MovieDto>> GetSimilarMoviesAsync(int movieId, int limit = 10)
    {
        var movie = await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .FirstOrDefaultAsync(m => m.Id == movieId);

        if (movie == null)
        {
            return new List<MovieDto>();
        }

        var movieGenres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList();

        var similarMovies = await _context.Movies
            .Where(m => m.Id != movieId)
            .Where(m => m.MovieGenres.Any(mg => movieGenres.Contains(mg.Genre.Name)))
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .OrderByDescending(m => m.MovieGenres.Count(mg => movieGenres.Contains(mg.Genre.Name)))
            .ThenByDescending(m => m.VoteAverage)
            .Take(limit)
            .ToListAsync();

        return similarMovies.Select(MapToMovieDto).ToList();
    }

    public async Task<List<MovieDto>> GetTrendingMoviesAsync(int limit = 10)
    {
        // Get movies with high ratings and recent activity
        var trendingMovies = await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .OrderByDescending(m => m.VoteAverage)
            .ThenByDescending(m => m.VoteCount)
            .ThenByDescending(m => m.Popularity)
            .Take(limit)
            .ToListAsync();

        return trendingMovies.Select(MapToMovieDto).ToList();
    }

    private static MovieDto MapToMovieDto(Movie movie)
    {
        return new MovieDto
        {
            Id = movie.Id,
            Title = movie.Title,
            Overview = movie.Overview,
            ReleaseDate = movie.ReleaseDate,
            VoteAverage = movie.VoteAverage,
            VoteCount = movie.VoteCount,
            PosterPath = movie.PosterPath,
            BackdropPath = movie.BackdropPath,
            TMDBId = movie.TMDBId,
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


