using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public interface ITMDBService
{
    Task<List<MovieDto>> GetPopularMoviesAsync(int page = 1);
    Task<List<MovieDto>> GetTrendingMoviesAsync(int page = 1);
    Task<List<MovieDto>> GetTopRatedMoviesAsync(int page = 1);
    Task<List<MovieDto>> SearchMoviesAsync(string query, int page = 1);
    Task<MovieDto?> GetMovieByIdAsync(int tmdbId);
    Task<List<string>> GetGenresAsync();
    Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1);
    Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1);
}


