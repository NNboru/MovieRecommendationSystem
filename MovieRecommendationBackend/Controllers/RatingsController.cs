using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RatingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/ratings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RatingDto>>> GetRatings()
    {
        var ratings = await _context.Ratings
            .Include(r => r.User)
            .Include(r => r.Movie)
            .Select(r => new RatingDto
            {
                Id = r.Id,
                UserId = r.UserId,
                MovieId = r.MovieId,
                Score = r.Score,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return Ok(ratings);
    }

    // GET: api/ratings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RatingDto>> GetRating(int id)
    {
        var rating = await _context.Ratings
            .Include(r => r.User)
            .Include(r => r.Movie)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rating == null)
        {
            return NotFound();
        }

        var ratingDto = new RatingDto
        {
            Id = rating.Id,
            UserId = rating.UserId,
            MovieId = rating.MovieId,
            Score = rating.Score,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt,
            UpdatedAt = rating.UpdatedAt
        };

        return Ok(ratingDto);
    }

    // GET: api/ratings/movie/5
    [HttpGet("movie/{movieId}")]
    public async Task<ActionResult<IEnumerable<RatingDto>>> GetRatingsByMovie(int movieId)
    {
        var ratings = await _context.Ratings
            .Where(r => r.MovieId == movieId)
            .Include(r => r.User)
            .Select(r => new RatingDto
            {
                Id = r.Id,
                UserId = r.UserId,
                MovieId = r.MovieId,
                Score = r.Score,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return Ok(ratings);
    }

    // POST: api/ratings
    [HttpPost]
    public async Task<ActionResult<RatingDto>> CreateRating(CreateRatingDto createRatingDto, [FromQuery] int userId, [FromQuery] int movieId)
    {
        // Check if user exists
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("User not found");
        }

        // Check if movie exists
        var movie = await _context.Movies.FindAsync(movieId);
        if (movie == null)
        {
            return BadRequest("Movie not found");
        }

        // Check if user already rated this movie
        var existingRating = await _context.Ratings
            .FirstOrDefaultAsync(r => r.UserId == userId && r.MovieId == movieId);

        if (existingRating != null)
        {
            return BadRequest("User has already rated this movie");
        }

        var rating = new Rating
        {
            UserId = userId,
            MovieId = movieId,
            Score = createRatingDto.Score,
            Comment = createRatingDto.Comment
        };

        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        var ratingDto = new RatingDto
        {
            Id = rating.Id,
            UserId = rating.UserId,
            MovieId = rating.MovieId,
            Score = rating.Score,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt,
            UpdatedAt = rating.UpdatedAt
        };

        return CreatedAtAction(nameof(GetRating), new { id = rating.Id }, ratingDto);
    }

    // PUT: api/ratings/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRating(int id, CreateRatingDto updateRatingDto)
    {
        var rating = await _context.Ratings.FindAsync(id);
        if (rating == null)
        {
            return NotFound();
        }

        rating.Score = updateRatingDto.Score;
        rating.Comment = updateRatingDto.Comment;
        rating.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RatingExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/ratings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRating(int id)
    {
        var rating = await _context.Ratings.FindAsync(id);
        if (rating == null)
        {
            return NotFound();
        }

        _context.Ratings.Remove(rating);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/ratings/average/movie/5
    [HttpGet("average/movie/{movieId}")]
    public async Task<ActionResult<object>> GetAverageRating(int movieId)
    {
        var averageRating = await _context.Ratings
            .Where(r => r.MovieId == movieId)
            .AverageAsync(r => (double)r.Score);

        var totalRatings = await _context.Ratings
            .CountAsync(r => r.MovieId == movieId);

        return Ok(new
        {
            MovieId = movieId,
            AverageRating = Math.Round(averageRating, 2),
            TotalRatings = totalRatings
        });
    }

    private bool RatingExists(int id)
    {
        return _context.Ratings.Any(e => e.Id == id);
    }
}


