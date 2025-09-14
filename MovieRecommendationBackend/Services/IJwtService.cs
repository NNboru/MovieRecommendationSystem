using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    int? GetUserIdFromToken(string token);
}
