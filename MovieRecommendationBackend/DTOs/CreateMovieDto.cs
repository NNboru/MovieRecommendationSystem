using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.DTOs;

public class CreateMovieDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string? Overview { get; set; }
    public string? ReleaseDate { get; set; }
    public double? VoteAverage { get; set; }
    public int? VoteCount { get; set; }
    public string? PosterPath { get; set; }
    public string? BackdropPath { get; set; }
    public int TMDBId { get; set; }
    public bool IsAdult { get; set; }
    public string? OriginalLanguage { get; set; }
    public string? OriginalTitle { get; set; }
    public double? Popularity { get; set; }
    public List<int> GenreIds { get; set; } = new List<int>();
}


