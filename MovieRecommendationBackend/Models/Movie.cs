using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.Models;

public class Movie
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Overview { get; set; }
    
    [MaxLength(20)]
    public string? ReleaseDate { get; set; }
    
    public double? VoteAverage { get; set; }
    
    public int? VoteCount { get; set; }
    
    [MaxLength(200)]
    public string? PosterPath { get; set; }
    
    [MaxLength(200)]
    public string? BackdropPath { get; set; }
    
    public int TMDBId { get; set; }
    
    public bool IsAdult { get; set; }
    
    [MaxLength(20)]
    public string? OriginalLanguage { get; set; }
    
    [MaxLength(200)]
    public string? OriginalTitle { get; set; }
    
    public double? Popularity { get; set; }
    
    // Navigation properties
    public ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
    public ICollection<LikeList> LikeLists { get; set; } = new List<LikeList>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}


