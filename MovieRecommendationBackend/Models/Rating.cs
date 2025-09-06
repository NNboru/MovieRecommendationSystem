using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.Models;

public class Rating
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    [Required]
    [Range(1, 5)]
    public int Score { get; set; }
    
    [MaxLength(500)]
    public string? Comment { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


