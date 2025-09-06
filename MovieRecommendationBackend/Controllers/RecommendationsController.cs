using Microsoft.AspNetCore.Mvc;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Services;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;

    public RecommendationsController(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
    }

    // GET: api/recommendations/personalized/{userId}
    [HttpGet("personalized/{userId}")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetPersonalizedRecommendations(int userId, [FromQuery] int limit = 10)
    {
        try
        {
            var recommendations = await _recommendationService.GetPersonalizedRecommendationsAsync(userId, limit);
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting personalized recommendations: {ex.Message}");
        }
    }

    // GET: api/recommendations/similar/{movieId}
    [HttpGet("similar/{movieId}")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetSimilarMovies(int movieId, [FromQuery] int limit = 10)
    {
        try
        {
            var similarMovies = await _recommendationService.GetSimilarMoviesAsync(movieId, limit);
            return Ok(similarMovies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting similar movies: {ex.Message}");
        }
    }

    // GET: api/recommendations/trending
    [HttpGet("trending")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetTrendingMovies([FromQuery] int limit = 10)
    {
        try
        {
            var trendingMovies = await _recommendationService.GetTrendingMoviesAsync(limit);
            return Ok(trendingMovies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting trending movies: {ex.Message}");
        }
    }
}


