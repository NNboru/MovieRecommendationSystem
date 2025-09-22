using System;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.DTOs;

public class LikeListItemDto
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public MovieDto Movie { get; set; } = null!;
    public LikeStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
