using System.Text.Json;
using Microsoft.Extensions.Configuration;
using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public class TMDBService : ITMDBService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public TMDBService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["TMDB:ApiKey"] ?? throw new InvalidOperationException("TMDB API key not configured");
        _baseUrl = configuration["TMDB:BaseUrl"] ?? "https://api.themoviedb.org/3";
    }

    public async Task<List<MovieDto>> GetPopularMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/movie/popular?api_key={_apiKey}&page={page}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return new List<MovieDto>();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TMDBResponse>(content);
        
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<List<MovieDto>> SearchMoviesAsync(string query, int page = 1)
    {
        var encodedQuery = Uri.EscapeDataString(query);
        var url = $"{_baseUrl}/search/movie?api_key={_apiKey}&query={encodedQuery}&page={page}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return new List<MovieDto>();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TMDBResponse>(content);
        
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<MovieDto?> GetMovieByIdAsync(int tmdbId)
    {
        var url = $"{_baseUrl}/movie/{tmdbId}?api_key={_apiKey}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return null;

        var content = await response.Content.ReadAsStringAsync();
        var movie = JsonSerializer.Deserialize<TMDBMovie>(content);
        
        return movie != null ? MapToMovieDto(movie) : null;
    }

    public async Task<List<string>> GetGenresAsync()
    {
        var url = $"{_baseUrl}/genre/movie/list?api_key={_apiKey}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return new List<string>();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TMDBGenreResponse>(content);
        
        return result?.Genres?.Select(g => g.Name).ToList() ?? new List<string>();
    }

    public async Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1)
    {
        var url = $"{_baseUrl}/discover/movie?api_key={_apiKey}&with_genres={genreId}&page={page}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return new List<MovieDto>();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TMDBResponse>(content);
        
        return result?.Results?.Select(MapToMovieDto).ToList() ?? new List<MovieDto>();
    }

    public async Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1)
    {
        var url = $"{_baseUrl}/movie/{movieId}/recommendations?api_key={_apiKey}&page={page}";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
            return new List<MovieDto>();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<TMDBResponse>(content);
        
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
        public List<TMDBMovie>? Results { get; set; }
    }

    private class TMDBMovie
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Overview { get; set; }
        public string? ReleaseDate { get; set; }
        public double VoteAverage { get; set; }
        public int VoteCount { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public bool Adult { get; set; }
        public string? OriginalLanguage { get; set; }
        public string? OriginalTitle { get; set; }
        public double Popularity { get; set; }
    }

    private class TMDBGenreResponse
    {
        public List<TMDBGenre>? Genres { get; set; }
    }

    private class TMDBGenre
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}


