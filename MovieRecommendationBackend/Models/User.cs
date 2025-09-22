using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? FirstName { get; set; }
    
    [MaxLength(100)]
    public string? LastName { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    
    // Navigation properties
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


