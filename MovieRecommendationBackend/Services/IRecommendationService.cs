using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public interface IRecommendationService
{
    Task<RecommendationResult> GetPersonalizedRecommendations(int userId, int page = 1);
    Task<UserRecommendationData> AnalyzeUserData(int userId);
}

public class RecommendationResult
{
    public List<MovieDto> Movies { get; set; } = new List<MovieDto>();
    public RecommendationStrategy Strategy { get; set; }
    public string Message { get; set; } = string.Empty;
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
}

public class UserRecommendationData
{
    public int LikedCount { get; set; }
    public int DislikedCount { get; set; }
    public RecommendationStrategy Strategy { get; set; }
    public List<MovieDto> LikedMovies { get; set; } = new List<MovieDto>();
    public List<MovieDto> DislikedMovies { get; set; } = new List<MovieDto>();
}

public enum RecommendationStrategy
{
    InsufficientData = 0,
    Advanced = 1
}

public class UserProfile
{
    public Dictionary<int, double> GenreWeights { get; set; } = new();
    public Dictionary<int, double> AvoidedGenres { get; set; } = new();
    public YearPreference YearPreferences { get; set; } = new();
    public RatingPreference RatingPreferences { get; set; } = new();
    public List<int> AvoidedMovieIds { get; set; } = new();
}

public class YearPreference
{
    public int PreferredStartYear { get; set; }
    public int PreferredEndYear { get; set; }
    public double YearWeight { get; set; } = 1.0;
}

public class RatingPreference
{
    public double MinRating { get; set; }
    public double PreferredRating { get; set; }
    public double RatingWeight { get; set; } = 1.0;
}

public class ScoredMovie
{
    public MovieDto Movie { get; set; } = null!;
    public double Score { get; set; }
    public double GenreScore { get; set; }
    public double YearScore { get; set; }
    public double RatingScore { get; set; }
}
