
namespace MovieRecommendationBackend.DTOs;

public class DefaultResponse
{
    public IEnumerable<object>? Data { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
    public string? ErrorMessage { get; set; }
}