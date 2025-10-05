using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public interface ITMDBService
{
    Task<DiscoverMoviesResult> GetPopularMoviesAsync(int page = 1, bool? includeAdult = null);
    Task<DiscoverMoviesResult> GetTheatreMoviesAsync(int page = 1);
    Task<DiscoverMoviesResult> GetTopRatedMoviesAsync(int page = 1);
    Task<DiscoverMoviesResult> SearchMoviesAsync(string query, int page = 1, bool? includeAdult = null);
    Task<MovieDto?> GetMovieByIdAsync(int tmdbId);
    Task<List<GenreDto>> GetGenresAsync();
    Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1);
    Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1);
    Task<List<MovieDto>> GetSimilarMoviesAsync(int movieId, int page = 1);
    Task<DiscoverMoviesResult> DiscoverMoviesAsync(DiscoverMoviesRequest request);
}

public class DiscoverMoviesRequest
{
    public string? Query { get; set; }
    public List<int>? Genres { get; set; } // Support multiple genres
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
    public int? MinVoteCount { get; set; } // Add vote count filter
    public string? ProductionCompanies { get; set; } // Support multiple production companies
    public string? Keywords { get; set; } // Support multiple keywords
    public int Page { get; set; } = 1;
}

public class DiscoverMoviesResult
{
    public List<MovieDto> Movies { get; set; } = new List<MovieDto>();
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
}


