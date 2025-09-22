using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.Models;

public class Watchlist
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

