using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieRecommendationBackend.Services;
using System.Security.Claims;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(
        IRecommendationService recommendationService,
        ILogger<RecommendationsController> logger)
    {
        _recommendationService = recommendationService;
        _logger = logger;
    }

    // GET: api/recommendations/personalized
    [HttpGet("personalized")]
    public async Task<ActionResult<RecommendationResult>> GetPersonalizedRecommendations([FromQuery] int page = 1)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var result = await _recommendationService.GetPersonalizedRecommendations(userId.Value, page);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting personalized recommendations");
            return StatusCode(500, "Error getting personalized recommendations");
        }
    }

    // GET: api/recommendations/user-data
    [HttpGet("user-data")]
    public async Task<ActionResult<UserRecommendationData>> GetUserRecommendationData()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("User not authenticated");
            }

            var userData = await _recommendationService.AnalyzeUserData(userId.Value);
            return Ok(userData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing user data");
            return StatusCode(500, "Error analyzing user data");
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
}
