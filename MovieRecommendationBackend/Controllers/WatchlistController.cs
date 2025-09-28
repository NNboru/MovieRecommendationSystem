using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;
using MovieRecommendationBackend.Services;
using Newtonsoft.Json;
using System.Security.Claims;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WatchlistController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ILogger<WatchlistController> _logger;

    private readonly ITMDBService _tmdbService;

    public WatchlistController(
        ApplicationDbContext context,
        IJwtService jwtService,
        ILogger<WatchlistController> logger,
        ITMDBService tmdbService)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
        _tmdbService = tmdbService;
    }

    // GET: api/GetWatchlist
    [HttpGet("getWatchlist")]
    public ActionResult<IEnumerable<MovieDto>> GetWatchlist()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("Invalid token");
            }

            var watchlistItems = _context.Watchlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Movie)
                    .ThenInclude(m => m.MovieGenres)
                        .ThenInclude(mg => mg.Genre)
                .OrderByDescending(w => w.CreatedAt);

            var movieDtos = watchlistItems.Select(w => new MovieDto
            {
                Id = w.Movie.Id,
                Title = w.Movie.Title,
                Overview = w.Movie.Overview,
                ReleaseDate = w.Movie.ReleaseDate,
                VoteAverage = w.Movie.VoteAverage,
                VoteCount = w.Movie.VoteCount,
                PosterPath = w.Movie.PosterPath,
                BackdropPath = w.Movie.BackdropPath,
                TMDBId = w.Movie.TMDBId,
                IsAdult = w.Movie.IsAdult,
                OriginalLanguage = w.Movie.OriginalLanguage,
                OriginalTitle = w.Movie.OriginalTitle,
                Popularity = w.Movie.Popularity,
                Genres = w.Movie.MovieGenres
                        .Select(mg => mg.Genre.Name)
                        .ToList(),
                CreatedAt = w.Movie.CreatedAt,
                UpdatedAt = w.Movie.UpdatedAt
            }).ToList();

            return Ok(movieDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving watchlist for user");
            return StatusCode(500, "Error retrieving watchlist");
        }
    }

    // POST: api/watchlist/addToWatchlist
    [HttpPost("addToWatchlist")]
    public async Task<ActionResult<WatchlistItemDto>> AddToWatchlist(AddToWatchlistDto addToWatchlistDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("Invalid token");
            }
            // Check if the movie exists in the database where movieId is TMDBId
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.TMDBId == addToWatchlistDto.MovieId);

            if (movie == null)
            {
                // If not, fetch movie details from an external source (e.g., TMDB API)
                var tmdbMovie = await _tmdbService.GetMovieByIdAsync(addToWatchlistDto.MovieId);

                if (tmdbMovie == null)
                {
                    return NotFound("Movie not found in external source.");
                }

                // Map tmdbMovie to your Movie entity
                var newMovie = new Movie
                {
                    // Assuming tmdbMovie.Id is the TMDBId, and you use auto-increment for your Movie.Id
                    Title = tmdbMovie.Title,
                    Overview = tmdbMovie.Overview,
                    ReleaseDate = tmdbMovie.ReleaseDate,
                    VoteAverage = tmdbMovie.VoteAverage,
                    VoteCount = tmdbMovie.VoteCount,
                    PosterPath = tmdbMovie.PosterPath,
                    BackdropPath = tmdbMovie.BackdropPath,
                    TMDBId = tmdbMovie.TMDBId,
                    IsAdult = tmdbMovie.IsAdult,
                    OriginalLanguage = tmdbMovie.OriginalLanguage,
                    OriginalTitle = tmdbMovie.OriginalTitle,
                    Popularity = tmdbMovie.Popularity,
                    MovieGenres = [],
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Add genres to the movie
                if (tmdbMovie.Genres != null && tmdbMovie.Genres.Count != 0)
                {
                    foreach (var genreName in tmdbMovie.Genres)
                    {
                        var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                        if (genre != null)
                        {
                            var movieGenre = new MovieGenre
                            {
                                MovieId = newMovie.Id,
                                GenreId = genre.Id
                            };
                            newMovie.MovieGenres.Add(movieGenre);
                        }
                    }
                }
                await _context.Movies.AddAsync(newMovie);
                await _context.MovieGenres.AddRangeAsync(newMovie.MovieGenres);
                await _context.SaveChangesAsync();

                // Update the MovieId in the DTO to the new movie's Id
                addToWatchlistDto.MovieId = newMovie.Id;
            }
            else
            {
                addToWatchlistDto.MovieId = movie.Id;
            }

            // Check if already in watchlist
            var existingWatchlistItem = await _context.Watchlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == addToWatchlistDto.MovieId);

            if (existingWatchlistItem != null)
            {
                return Conflict("Movie is already in your watchlist");
            }

            // Add to watchlist
            var watchlistItem = new Watchlist
            {
                UserId = userId.Value,
                MovieId = addToWatchlistDto.MovieId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Watchlists.Add(watchlistItem);
            await _context.SaveChangesAsync();

            // Return the created watchlist item
            var createdItem = await _context.Watchlists
                .Include(w => w.Movie)
                .Where(w => w.Id == watchlistItem.Id)
                .Select(w => new WatchlistItemDto
                {
                    Id = w.Id,
                    MovieId = w.MovieId,
                    Movie = new MovieDto
                    {
                        Id = w.Movie.Id,
                        Title = w.Movie.Title,
                        Overview = w.Movie.Overview,
                        ReleaseDate = w.Movie.ReleaseDate,
                        VoteAverage = w.Movie.VoteAverage,
                        VoteCount = w.Movie.VoteCount,
                        PosterPath = w.Movie.PosterPath,
                        BackdropPath = w.Movie.BackdropPath,
                        TMDBId = w.Movie.TMDBId,
                        IsAdult = w.Movie.IsAdult,
                        OriginalLanguage = w.Movie.OriginalLanguage,
                        OriginalTitle = w.Movie.OriginalTitle,
                        Popularity = w.Movie.Popularity,
                        Genres = w.Movie.MovieGenres
                            .Select(mg => mg.Genre.Name)
                            .ToList(),
                        CreatedAt = w.Movie.CreatedAt,
                        UpdatedAt = w.Movie.UpdatedAt
                    },
                    CreatedAt = w.CreatedAt
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetWatchlist), new { id = watchlistItem.Id }, createdItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding movie to watchlist");
            return StatusCode(500, "Error adding movie to watchlist");
        }
    }

    // DELETE: api/watchlist/{movieId}
    [HttpDelete("{movieId}")]
    public async Task<IActionResult> RemoveFromWatchlist(int movieId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("Invalid token");
            }

            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.TMDBId == movieId);
            Watchlist? watchlistItem = null;
            if (movie != null)
            {
                watchlistItem = await _context.Watchlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movie.Id);
            }

            
            if (watchlistItem == null)
            {
                return NotFound("Movie not found in your watchlist");
            }

            _context.Watchlists.Remove(watchlistItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing movie from watchlist");
            return StatusCode(500, "Error removing movie from watchlist");
        }
    }

    // GET: api/watchlist/check/{movieId}
    [HttpGet("check/{movieId}")]
    public async Task<ActionResult<bool>> IsInWatchlist(int movieId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized("Invalid token");
            }

            var isInWatchlist = await _context.Watchlists
                .AnyAsync(w => w.UserId == userId && w.MovieId == movieId);

            return Ok(new { isInWatchlist });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking watchlist status");
            return StatusCode(500, "Error checking watchlist status");
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }

    private async Task PopulateMovieGenres(Movie movie)
    {
        try
        {
            // Fetch movie details from TMDB to get genres
            var tmdbMovie = await _tmdbService.GetMovieByIdAsync(movie.TMDBId);
            if (tmdbMovie != null && tmdbMovie.Genres != null && tmdbMovie.Genres.Any())
            {
                foreach (var genreName in tmdbMovie.Genres)
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error populating genres for movie {MovieId}", movie.Id);
        }
    }
}
