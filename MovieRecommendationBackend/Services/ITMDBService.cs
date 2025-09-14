using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public interface ITMDBService
{
    Task<List<MovieDto>> GetPopularMoviesAsync(int page = 1, bool? includeAdult = null);
    Task<List<MovieDto>> GetTrendingMoviesAsync(int page = 1);
    Task<List<MovieDto>> GetTopRatedMoviesAsync(int page = 1);
    Task<List<MovieDto>> SearchMoviesAsync(string query, int page = 1, bool? includeAdult = null);
    Task<MovieDto?> GetMovieByIdAsync(int tmdbId);
    Task<List<GenreDto>> GetGenresAsync();
    Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1);
    Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1);
    Task<List<MovieDto>> DiscoverMoviesAsync(DiscoverMoviesRequest request);
}

public class DiscoverMoviesRequest
{
    public string? Query { get; set; }
    public int? Genre { get; set; }
    public string? ReleaseDateFrom { get; set; }
    public string? ReleaseDateTo { get; set; }
    public string? Language { get; set; }
    public double? MinRating { get; set; }
    public double? MaxRating { get; set; }
    public int? Year { get; set; }
    public int? MinRuntime { get; set; }
    public int? MaxRuntime { get; set; }
    public bool? Adult { get; set; }
    public string? Certification { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    public int Page { get; set; } = 1;
}


