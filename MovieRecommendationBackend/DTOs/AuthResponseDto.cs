namespace MovieRecommendationBackend.DTOs;

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new UserDto();
    public string Message { get; set; } = string.Empty;
}
