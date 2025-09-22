using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.DTOs;

public class AddToWatchlistDto
{
    [Required]
    public int MovieId { get; set; }
}

