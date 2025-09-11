using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public class TMDBService : ITMDBService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly ILogger<TMDBService> _logger;

    public TMDBService(HttpClient httpClient, IConfiguration configuration, ILogger<TMDBService> logger)
    {
        _httpClient = httpClient;
        _baseUrl = configuration["TMDB:BaseUrl"] ?? "";
        _logger = logger;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", configuration["TMDB:ApiKey"]);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    private async Task<string> ApiCall(string url)
    {
        var response = await _httpClient.GetAsync(url);
        _logger.LogInformation("TMDB API response status: {StatusCode}", response.StatusCode);

        string content = await response.Content.ReadAsStringAsync(); ;
        if (!response.IsSuccessStatusCode || (!string.IsNullOrEmpty(content) && content[0] == '<'))
        {
            response = await _httpClient.GetAsync(url);
            content = await response.Content.ReadAsStringAsync();
        }
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("TMDB API request failed with status {StatusCode}: {ErrorContent}", response.StatusCode, content);
        }
        else if (!string.IsNullOrEmpty(content) && content[0] == '<')
        {
            _logger.LogError("TMDB API request failed with status {StatusCode}: {ErrorContent}", response.StatusCode, content);
        }
        else
        {
            _logger.LogInformation("TMDB API success response content: {Content}", content);
            return content;
        }
        return "{}";
    }

    public async Task<List<MovieDto>> GetPopularMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/movie/popular?language=en-US&page={page}";
        _logger.LogInformation("\nMaking TMDB API request to: {Url} {headers} \n", url, JsonConvert.SerializeObject(_httpClient.DefaultRequestHeaders));

        string content = await ApiCall(url);

        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} popular movies from TMDB", result?.Results?.Count ?? 0);
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }


    public async Task<List<MovieDto>> GetTrendingMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/trending/movie/week?page={page}";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} trending movies from TMDB", result?.Results?.Count ?? 0);
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<List<MovieDto>> GetTopRatedMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/movie/top_rated?&page={page}";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} top-rated movies from TMDB", result?.Results?.Count ?? 0);
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<List<MovieDto>> SearchMoviesAsync(string query, int page = 1)
    {
        var encodedQuery = Uri.EscapeDataString(query);
        var url = $"{_baseUrl}/search/movie?query={encodedQuery}&page={page}";
        _logger.LogInformation("Making TMDB API search request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} search results from TMDB", result?.Results?.Count ?? 0);
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<MovieDto?> GetMovieByIdAsync(int tmdbId)
    {
        var url = $"{_baseUrl}/movie/{tmdbId}";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var movie = JsonConvert.DeserializeObject<TMDBMovie>(content);

        _logger.LogInformation("Successfully retrieved movie details from TMDB: {Title}", movie?.Title);
        return movie != null ? MapToMovieDto(movie) : null;
    }

    public async Task<List<string>> GetGenresAsync()
    {
        var url = $"{_baseUrl}/genre/movie/list";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBGenreResponse>(content);

        return result?.Genres?.Select(g => g.Name).ToList() ?? new List<string>();
    }

    public async Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1)
    {
        var url = $"{_baseUrl}/discover/movie?with_genres={genreId}&page={page}";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1)
    {
        var url = $"{_baseUrl}/movie/{movieId}/recommendations?page={page}";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    private static MovieDto MapToMovieDto(TMDBMovie movie)
    {
        return new MovieDto
        {
            TMDBId = movie.Id,
            Title = movie.Title,
            Overview = movie.Overview,
            ReleaseDate = movie.ReleaseDate,
            VoteAverage = movie.VoteAverage,
            VoteCount = movie.VoteCount,
            PosterPath = movie.PosterPath,
            BackdropPath = movie.BackdropPath,
            IsAdult = movie.Adult,
            OriginalLanguage = movie.OriginalLanguage,
            OriginalTitle = movie.OriginalTitle,
            Popularity = movie.Popularity,
            Genres = new List<string>()
        };
    }

    // TMDB API response models
    private class TMDBResponse
    {
        [JsonProperty("results")]
        public List<TMDBMovie>? Results { get; set; }
    }

    private class TMDBMovie
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; } = string.Empty;

        [JsonProperty("overview")]
        public string? Overview { get; set; }

        [JsonProperty("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonProperty("vote_average")]
        public double VoteAverage { get; set; }

        [JsonProperty("vote_count")]
        public int VoteCount { get; set; }

        [JsonProperty("poster_path")]
        public string? PosterPath { get; set; }

        [JsonProperty("backdrop_path")]
        public string? BackdropPath { get; set; }

        [JsonProperty("adult")]
        public bool Adult { get; set; }

        [JsonProperty("original_language")]
        public string? OriginalLanguage { get; set; }

        [JsonProperty("original_title")]
        public string? OriginalTitle { get; set; }

        [JsonProperty("popularity")]
        public double Popularity { get; set; }

        [JsonProperty("genre_ids")]
        public List<int> GenreIds { get; set; } = new List<int>();
    }

    private class TMDBGenreResponse
    {
        [JsonProperty("genres")]
        public List<TMDBGenre>? Genres { get; set; }
    }

    private class TMDBGenre
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;
    }
}


