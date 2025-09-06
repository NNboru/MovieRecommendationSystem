using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.DTOs;

public class RatingDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int MovieId { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int Score { get; set; }
    
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateRatingDto
{
    [Required]
    [Range(1, 5)]
    public int Score { get; set; }
    
    public string? Comment { get; set; }
}


