using System.ComponentModel.DataAnnotations;

namespace MovieRecommendationBackend.DTOs;

public class UpdateProfileDto
{
    [StringLength(100, MinimumLength = 3)]
    public string? Username { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [StringLength(100)]
    public string? FirstName { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
}
