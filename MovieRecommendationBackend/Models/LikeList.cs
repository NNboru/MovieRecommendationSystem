using System;
using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.Models;

public class LikeList
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    public LikeStatus Status { get; set; } // Liked or Disliked
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
