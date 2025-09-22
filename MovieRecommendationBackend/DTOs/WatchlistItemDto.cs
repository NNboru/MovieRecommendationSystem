namespace MovieRecommendationBackend.DTOs;

public class WatchlistItemDto
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public MovieDto Movie { get; set; } = new MovieDto();
    public DateTime CreatedAt { get; set; }
}

