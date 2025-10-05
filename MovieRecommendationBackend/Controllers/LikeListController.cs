using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;
using MovieRecommendationBackend.Services;
using System.Security.Claims;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LikeListController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly TMDBService _tmdbService;

    public LikeListController(ApplicationDbContext context, TMDBService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    [HttpGet("getLikeList")]
    public async Task<ActionResult<List<LikeListItemDto>>> GetLikeList()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var likeListItems = await _context.LikeLists
            .Include(l => l.Movie)
            .ThenInclude(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.UpdatedAt)
            .ToListAsync();

        var likeListDtos = likeListItems.Select(item => new LikeListItemDto
        {
            Id = item.Id,
            MovieId = item.MovieId,
            Movie = new MovieDto
            {
                Id = item.Movie.Id,
                Title = item.Movie.Title,
                Overview = item.Movie.Overview,
                ReleaseDate = item.Movie.ReleaseDate,
                VoteAverage = item.Movie.VoteAverage,
                VoteCount = item.Movie.VoteCount,
                PosterPath = item.Movie.PosterPath,
                BackdropPath = item.Movie.BackdropPath,
                TMDBId = item.Movie.TMDBId,
                IsAdult = item.Movie.IsAdult,
                OriginalLanguage = item.Movie.OriginalLanguage,
                OriginalTitle = item.Movie.OriginalTitle,
                Popularity = item.Movie.Popularity,
                Genres = item.Movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
                CreatedAt = item.Movie.CreatedAt,
            },
            Status = item.Status,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        }).ToList();

        return Ok(likeListDtos);
    }

    [HttpPost("addToLikeList")]
    public async Task<ActionResult<LikeListItemDto>> AddToLikeList([FromBody] AddToLikeListDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        // First, get the movie from our database (by TMDB ID)
        var movie = await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .FirstOrDefaultAsync(m => m.TMDBId == dto.MovieId);

        // If movie doesn't exist in our database, fetch from TMDB
        if (movie == null)
        {
            var tmdbMovies = await _tmdbService.GetMovieByIdAsync(dto.MovieId);
            if (tmdbMovies == null)
                return NotFound("Movie not found in external source.");

            movie = new Movie
            {
                TMDBId = tmdbMovies.TMDBId,
                Title = tmdbMovies.Title,
                Overview = tmdbMovies.Overview,
                ReleaseDate = tmdbMovies.ReleaseDate,
                VoteAverage = tmdbMovies.VoteAverage,
                VoteCount = tmdbMovies.VoteCount,
                PosterPath = tmdbMovies.PosterPath,
                BackdropPath = tmdbMovies.BackdropPath,
                IsAdult = tmdbMovies.IsAdult,
                OriginalLanguage = tmdbMovies.OriginalLanguage,
                OriginalTitle = tmdbMovies.OriginalTitle,
                Popularity = tmdbMovies.Popularity,
                TrailerId = tmdbMovies.TrailerId,
                ProductionCompanies = string.Join(',', tmdbMovies.ProductionCompanies ?? []),
                Keywords = string.Join(',', tmdbMovies.Keywords ?? []),
                CreatedAt = DateTime.UtcNow,
            };

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            // Add genres
            if (tmdbMovies.Genres != null && tmdbMovies.Genres.Any())
            {
                foreach (var genreName in tmdbMovies.Genres)
                {
                    var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                    if (genre != null)
                    {
                        var movieGenre = new MovieGenre
                        {
                            MovieId = movie.Id,
                            GenreId = genre.Id
                        };
                        _context.MovieGenres.Add(movieGenre);
                    }
                }
                await _context.SaveChangesAsync();
            }
        }

        // Now check if movie already exists in user's like list (using internal Movie ID)
        var existingLike = await _context.LikeLists
            .FirstOrDefaultAsync(l => l.UserId == userId && l.MovieId == movie.Id);

        if (existingLike != null)
        {
            // Update existing like/dislike
            existingLike.Status = dto.Status;
            existingLike.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new like/dislike entry
            var likeListItem = new LikeList
            {
                UserId = userId.Value,
                MovieId = movie.Id,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.LikeLists.Add(likeListItem);
        }

        await _context.SaveChangesAsync();

        // Return the like list item DTO
        var result = new LikeListItemDto
        {
            Id = existingLike?.Id ?? _context.LikeLists.First(l => l.UserId == userId && l.MovieId == movie.Id).Id,
            MovieId = movie.Id,
            Movie = new MovieDto
            {
                Id = movie.Id,
                Title = movie.Title,
                Overview = movie.Overview,
                ReleaseDate = movie.ReleaseDate,
                VoteAverage = movie.VoteAverage,
                VoteCount = movie.VoteCount,
                PosterPath = movie.PosterPath,
                BackdropPath = movie.BackdropPath,
                TMDBId = movie.TMDBId,
                IsAdult = movie.IsAdult,
                OriginalLanguage = movie.OriginalLanguage,
                OriginalTitle = movie.OriginalTitle,
                Popularity = movie.Popularity,
                Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
                CreatedAt = movie.CreatedAt,
            },
            Status = dto.Status,
            CreatedAt = existingLike?.CreatedAt ?? DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Ok(result);
    }

    [HttpDelete("{movieId}")]
    public async Task<ActionResult> RemoveFromLikeList(int movieId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        // First find the movie by TMDB ID to get the internal Movie ID
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TMDBId == movieId);
        if (movie == null)
            return NotFound("Movie not found.");


        var likeListItem = await _context.LikeLists
            .FirstOrDefaultAsync(l => l.UserId == userId && l.MovieId == movie.Id);

        if (likeListItem == null)
            return NotFound("Movie not found in like list.");

        _context.LikeLists.Remove(likeListItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Movie removed from like list successfully." });
    }

    [HttpGet("checkLikeStatus/{movieId}")]
    public async Task<ActionResult<object>> CheckLikeStatus(int movieId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        // First find the movie by TMDB ID to get the internal Movie ID
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.TMDBId == movieId);
        if (movie == null)
            return Ok(new { status = "none" });

        var likeListItem = await _context.LikeLists
            .FirstOrDefaultAsync(l => l.UserId == userId && l.MovieId == movie.Id);

        if (likeListItem == null)
            return Ok(new { status = "none" });

        return Ok(new { status = likeListItem.Status.ToString().ToLower() });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : null;
    }
}
