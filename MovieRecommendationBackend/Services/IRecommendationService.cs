using MovieRecommendationBackend.DTOs;

namespace MovieRecommendationBackend.Services;

public interface IRecommendationService
{
    Task<List<MovieDto>> GetPersonalizedRecommendationsAsync(int userId, int limit = 10);
    Task<List<MovieDto>> GetSimilarMoviesAsync(int movieId, int limit = 10);
    Task<List<MovieDto>> GetTrendingMoviesAsync(int limit = 10);
}


