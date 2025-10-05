using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using MovieRecommendationBackend.DTOs;
using System.Threading.Tasks;

namespace MovieRecommendationBackend.Services;

public class TMDBService : ITMDBService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly ILogger<TMDBService> _logger;
    private static Dictionary<int, string>? _genreCache;

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

        string content = await response.Content.ReadAsStringAsync();
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
            _logger.LogInformation("TMDB API success url: {url} response: {Content}",url, content);
            return content;
        }
        return "{}";
    }

    public async Task<DiscoverMoviesResult> GetPopularMoviesAsync(int page = 1, bool? includeAdult = null)
    {
        var url = $"{_baseUrl}/movie/popular?language=en-US&page={page}";
        
        if (includeAdult.HasValue)
        {
            url += $"&include_adult={includeAdult.Value.ToString().ToLower()}";
        }
        
        _logger.LogInformation("\nMaking TMDB API request to: {Url} {headers} \n", url, JsonConvert.SerializeObject(_httpClient.DefaultRequestHeaders));

        string content = await ApiCall(url);

        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} popular movies from TMDB", result?.Results?.Count ?? 0);
        
        var movies = await MapResultsToMovies(result?.Results);
        
        return new DiscoverMoviesResult
        {
            Movies = movies,
            Page = result?.Page ?? 1,
            TotalPages = result?.TotalPages ?? 1,
            TotalResults = result?.TotalResults ?? 0
        };
    }


    public async Task<DiscoverMoviesResult> GetTheatreMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/movie/now_playing?&page={page}";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} trending movies from TMDB", result?.Results?.Count ?? 0);
        
        var movies = await MapResultsToMovies(result?.Results);
        
        return new DiscoverMoviesResult
        {
            Movies = movies,
            Page = result?.Page ?? 1,
            TotalPages = result?.TotalPages ?? 1,
            TotalResults = result?.TotalResults ?? 0
        };
    }

    public async Task<DiscoverMoviesResult> GetTopRatedMoviesAsync(int page = 1)
    {
        var url = $"{_baseUrl}/movie/top_rated?&page={page}";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} top-rated movies from TMDB", result?.Results?.Count ?? 0);
        
        var movies = await MapResultsToMovies(result?.Results);
        
        return new DiscoverMoviesResult
        {
            Movies = movies,
            Page = result?.Page ?? 1,
            TotalPages = result?.TotalPages ?? 1,
            TotalResults = result?.TotalResults ?? 0
        };
    }

    public async Task<DiscoverMoviesResult> SearchMoviesAsync(string query, int page = 1, bool? includeAdult = null)
    {
        var encodedQuery = Uri.EscapeDataString(query);
        var url = $"{_baseUrl}/search/movie?query={encodedQuery}&page={page}";
        
        if (includeAdult.HasValue)
        {
            url += $"&include_adult={includeAdult.Value.ToString().ToLower()}";
        }
        
        _logger.LogInformation("Making TMDB API search request to: {Url}", url);

        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        _logger.LogInformation("Successfully retrieved {Count} search results from TMDB", result?.Results?.Count ?? 0);
        
        var movies = await MapResultsToMovies(result?.Results);
        
        return new DiscoverMoviesResult
        {
            Movies = movies,
            Page = result?.Page ?? 1,
            TotalPages = result?.TotalPages ?? 1,
            TotalResults = result?.TotalResults ?? 0
        };
    }

    public async Task<MovieDto?> GetMovieByIdAsync(int tmdbId)
    {
        var url = $"{_baseUrl}/movie/{tmdbId}?append_to_response=videos,keywords,production_companies";
        _logger.LogInformation("Making TMDB API request to: {Url}", url);

        string content = await ApiCall(url);
        var movie = JsonConvert.DeserializeObject<TMDBMovie>(content);

        _logger.LogInformation("Successfully retrieved movie details from TMDB: {Title}", movie?.Title);
        return movie != null ? await MapToMovieDto(movie) : null;
    }

    public async Task<List<GenreDto>> GetGenresAsync()
    {
        var url = $"{_baseUrl}/genre/movie/list";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBGenreResponse>(content);

        return result?.Genres?.Select(genre => MapToGenreDto(genre))?.ToList() ?? new List<GenreDto>();
    }

    public async Task<List<MovieDto>> GetMoviesByGenreAsync(int genreId, int page = 1)
    {
        var url = $"{_baseUrl}/discover/movie?with_genres={genreId}&page={page}";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        return await MapResultsToMovies(result?.Results);
    }

    public async Task<List<MovieDto>> GetRecommendationsAsync(int movieId, int page = 1)
    {
        var url = $"{_baseUrl}/movie/{movieId}/recommendations?page={page}";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        return await MapResultsToMovies(result?.Results);
    }

    public async Task<List<MovieDto>> GetSimilarMoviesAsync(int movieId, int page = 1)
    {
        var url = $"{_baseUrl}/movie/{movieId}/similar?page={page}";
        string content = await ApiCall(url);
        var result = JsonConvert.DeserializeObject<TMDBResponse>(content);

        return await MapResultsToMovies(result?.Results);
    }

    public async Task<DiscoverMoviesResult> DiscoverMoviesAsync(DiscoverMoviesRequest request)
    {
        var queryParams = new List<string>();
        
        // Add page parameter
        queryParams.Add($"page={request.Page}");
        
        // Add language
        queryParams.Add("language=en-US");
        
        // Add sort by parameter
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var sortBy = request.SortBy.ToLower() switch
            {
                "popularity" => "popularity",
                "vote_average" => "vote_average",
                "release_date" => "release_date",
                "title" => "title",
                _ => "popularity"
            };
            queryParams.Add($"sort_by={sortBy}.desc");
        }
        
        // Add genre filters (support multiple genres)
        if (request.Genres != null && request.Genres.Any())
        {
            var genreIds = string.Join(",", request.Genres);
            queryParams.Add($"with_genres={genreIds}");
        }
        
        // Add release date filters
        if (!string.IsNullOrWhiteSpace(request.ReleaseDateFrom))
        {
            queryParams.Add($"primary_release_date.gte={request.ReleaseDateFrom}");
        }
        
        if (!string.IsNullOrWhiteSpace(request.ReleaseDateTo))
        {
            queryParams.Add($"primary_release_date.lte={request.ReleaseDateTo}");
        }
        
        // Add year filter
        if (request.Year.HasValue)
        {
            queryParams.Add($"primary_release_year={request.Year.Value}");
        }
        
        // Add language filter
        if (!string.IsNullOrWhiteSpace(request.Language))
        {
            queryParams.Add($"with_original_language={request.Language}");
        }
        
        // Add rating filters
        if (request.MinRating.HasValue)
        {
            queryParams.Add($"vote_average.gte={request.MinRating.Value}");
        }
        
        // Remove max rating filter - only use min rating
        
        // Add vote count filter
        if (request.MinVoteCount.HasValue)
        {
            queryParams.Add($"vote_count.gte={request.MinVoteCount.Value}");
        }
        
        // Add runtime filters
        if (request.MinRuntime.HasValue)
        {
            queryParams.Add($"with_runtime.gte={request.MinRuntime.Value}");
        }
        
        if (request.MaxRuntime.HasValue)
        {
            queryParams.Add($"with_runtime.lte={request.MaxRuntime.Value}");
        }
        
        // Add adult content filter
        if (request.Adult.HasValue)
        {
            queryParams.Add($"include_adult={request.Adult.Value.ToString().ToLower()}");
        }
        
        // Add certification filter
        if (!string.IsNullOrWhiteSpace(request.Certification))
        {
            queryParams.Add($"certification={request.Certification}");
        }
        
        // Add production company filters (support multiple companies)
        if (!string.IsNullOrWhiteSpace(request.ProductionCompanies))
        {
            queryParams.Add($"with_companies={request.ProductionCompanies}");
        }
        
        // Add keyword filters (support multiple keywords)
        if (!string.IsNullOrWhiteSpace(request.Keywords))
        {
            queryParams.Add($"with_keywords={request.Keywords}");
        }
        
        // Handle text search - if query is provided, use search endpoint instead
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            // For text search, we'll use the search endpoint but apply other filters
            var searchUrl = $"{_baseUrl}/search/movie?query={Uri.EscapeDataString(request.Query)}&page={request.Page}&language=en-US";
            
            if (request.Adult.HasValue)
            {
                searchUrl += $"&include_adult={request.Adult.Value.ToString().ToLower()}";
            }
            
            string content = await ApiCall(searchUrl);
            var result = JsonConvert.DeserializeObject<TMDBResponse>(content);
            var searchMovies = await MapResultsToMovies(result?.Results);
            
            // Apply additional filters on the search results
            var filteredMovies = ApplyClientSideFilters(searchMovies, request);
            
            return new DiscoverMoviesResult
            {
                Movies = filteredMovies,
                Page = result?.Page ?? 1,
                TotalPages = result?.TotalPages ?? 1,
                TotalResults = result?.TotalResults ?? 0
            };
        }
        
        // Build the discover URL
        var discoverUrl = $"{_baseUrl}/discover/movie?{string.Join("&", queryParams)}";
        
        string discoverContent = await ApiCall(discoverUrl);
        var discoverResult = JsonConvert.DeserializeObject<TMDBResponse>(discoverContent);
        
        var movies = await MapResultsToMovies(discoverResult?.Results);
        
        return new DiscoverMoviesResult
        {
            Movies = movies,
            Page = discoverResult?.Page ?? 1,
            TotalPages = discoverResult?.TotalPages ?? 1,
            TotalResults = discoverResult?.TotalResults ?? 0
        };
    }
    
    private static List<MovieDto> ApplyClientSideFilters(List<MovieDto> movies, DiscoverMoviesRequest request)
    {
        var filteredMovies = movies.AsEnumerable();
        
        // Apply runtime filters (if not handled by TMDB API)
        if (request.MinRuntime.HasValue || request.MaxRuntime.HasValue)
        {
            filteredMovies = filteredMovies.Where(m => 
                (!request.MinRuntime.HasValue || (m.Runtime ?? 0) >= request.MinRuntime.Value) &&
                (!request.MaxRuntime.HasValue || (m.Runtime ?? 0) <= request.MaxRuntime.Value));
        }
        
        // Apply certification filter (if not handled by TMDB API)
        if (!string.IsNullOrWhiteSpace(request.Certification))
        {
            filteredMovies = filteredMovies.Where(m => m.Certification == request.Certification);
        }
        
        return filteredMovies.ToList();
    }

    private async Task<MovieDto> MapToMovieDto(TMDBMovie movie)
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
            Genres = await MapGenreIdsToNames(movie),
            ProductionCompanies = MapProductionCompanies(movie),
            Keywords = MapKeywords(movie),
            ProductionCompaniesNames = MapProductionCompaniesNames(movie),
            KeywordsNames = MapKeywordsNames(movie),
            TrailerId = GetTrailerId(movie),
        };
    }

    private static string? GetTrailerId(TMDBMovie movie)
    {
        if (movie.Videos?.Results == null || !movie.Videos.Results.Any())
            return null;

        // First, try to find a video with type "Trailer"
        var trailer = movie.Videos.Results.FirstOrDefault(v => 
            v.Type?.Equals("Trailer", StringComparison.OrdinalIgnoreCase) == true);

        if (trailer != null)
            return trailer.Key;

        // If no trailer found, return the first video
        return movie.Videos.Results.FirstOrDefault()?.Key;
    }

    private static GenreDto MapToGenreDto(TMDBGenre genre)
    {
        return new GenreDto
        {
            Name = genre.Name,
            Id = genre.Id
        };
    }

    private async Task<List<string>> MapGenreIdsToNames(TMDBMovie movie)
    {
        if (movie.Genres != null)
        {
            return movie.Genres.Select(g => g.Name).ToList();
        }
        // Initialize genre cache if not already done
        if (_genreCache == null)
        {
            await InitializeGenreCache();
        }

        var genreNames = new List<string>();
        foreach (var genreId in movie.GenreIds ?? [])
        {
            if (_genreCache!.TryGetValue(genreId, out var genreName))
            {
                genreNames.Add(genreName);
            }
        }
        return genreNames ?? [];
    }

    private static List<string> MapProductionCompanies(TMDBMovie movie)
    {
        return movie.ProductionCompanies?.Select(pc => pc.Id.ToString()).ToList() ?? new List<string>();
    }

    private static List<string> MapKeywords(TMDBMovie movie)
    {
        return movie.Keywords?.Keywords?.Select(k => k.Id.ToString()).ToList() ?? new List<string>();
    }

    private static List<string> MapProductionCompaniesNames(TMDBMovie movie)
    {
        return movie.ProductionCompanies?.Select(pc => pc.Name).ToList() ?? new List<string>();
    }

    private static List<string> MapKeywordsNames(TMDBMovie movie)
    {
        return movie.Keywords?.Keywords?.Select(k => k.Name).ToList() ?? new List<string>();
    }

    private async Task<List<MovieDto>> MapResultsToMovies(List<TMDBMovie>? results)
    {
        var movies = new List<MovieDto>();
        if (results != null)
        {
            foreach (var movie in results)
            {
                if (true)
                {
                    movies.Add(await MapToMovieDto(movie));
                }
            }
        }
        return movies;
    }

    private async Task InitializeGenreCache()
    {
        try
        {
            var genres = await GetGenresAsync();
            _genreCache = genres.ToDictionary(g => g.Id, g => g.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize genre cache");
            _genreCache = [];
        }
    }

    // TMDB API response models
    private class TMDBResponse
    {
        [JsonProperty("results")]
        public List<TMDBMovie>? Results { get; set; }
        
        [JsonProperty("page")]
        public int Page { get; set; }
        
        [JsonProperty("total_pages")]
        public int TotalPages { get; set; }
        
        [JsonProperty("total_results")]
        public int TotalResults { get; set; }
    }

    private class TMDBMovie
    {
        [JsonProperty("adult")]
        public bool Adult { get; set; }

        [JsonProperty("backdrop_path")]
        public string? BackdropPath { get; set; }

        [JsonProperty("genres")]       
        public List<TMDBGenre>? Genres { get; set; }

        [JsonProperty("genre_ids")]
        public List<int>? GenreIds { get; set; }

        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("original_language")]
        public string? OriginalLanguage { get; set; }

        [JsonProperty("original_title")]
        public string? OriginalTitle { get; set; }

        [JsonProperty("overview")]
        public string? Overview { get; set; }

        [JsonProperty("popularity")]
        public double Popularity { get; set; }

        [JsonProperty("poster_path")]
        public string? PosterPath { get; set; }

        [JsonProperty("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; } = string.Empty;

        [JsonProperty("vote_average")]
        public double VoteAverage { get; set; }

        [JsonProperty("vote_count")]
        public int VoteCount { get; set; }

        [JsonProperty("videos")]
        public TMDBVideos? Videos { get; set; }

        [JsonProperty("production_companies")]
        public List<TMDBProductionCompany>? ProductionCompanies { get; set; }

        [JsonProperty("keywords")]
        public TMDBKeywords? Keywords { get; set; }
    }

    private class TMDBVideos
    {
        [JsonProperty("results")]
        public List<TMDBVideo>? Results { get; set; }
    }

    private class TMDBVideo
    {
        [JsonProperty("iso_639_1")]
        public string? Iso6391 { get; set; }

        [JsonProperty("iso_3166_1")]
        public string? Iso31661 { get; set; }

        [JsonProperty("name")]
        public string? Name { get; set; }

        [JsonProperty("key")]
        public string? Key { get; set; }

        [JsonProperty("site")]
        public string? Site { get; set; }

        [JsonProperty("size")]
        public int Size { get; set; }

        [JsonProperty("type")]
        public string? Type { get; set; }

        [JsonProperty("official")]
        public bool Official { get; set; }

        [JsonProperty("published_at")]
        public string? PublishedAt { get; set; }

        [JsonProperty("id")]
        public string? Id { get; set; }
    }

    private class TMDBProductionCompany
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("logo_path")]
        public string? LogoPath { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("origin_country")]
        public string? OriginCountry { get; set; }
    }

    private class TMDBKeywords
    {
        [JsonProperty("keywords")]
        public List<TMDBKeyword>? Keywords { get; set; }
    }

    private class TMDBKeyword
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;
    }

    private class TMDBGenreResponse
    {
        [JsonProperty("genres")]
        public List<TMDBGenre>? Genres { get; set; }
    }

    public class TMDBGenre
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;
    }
}


