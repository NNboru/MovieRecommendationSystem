using System.ComponentModel.DataAnnotations;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.DTOs;

public class AddToLikeListDto
{
    [Required]
    public int MovieId { get; set; }
    
    [Required]
    public LikeStatus Status { get; set; }
}
