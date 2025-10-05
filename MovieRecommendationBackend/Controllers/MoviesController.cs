using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.DTOs;
using MovieRecommendationBackend.Models;
using MovieRecommendationBackend.Services;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITMDBService _tmdbService;
    private static DefaultResponse CreateUIResponse(IEnumerable<object> data)
    {
        return new DefaultResponse
        {
            Data = data,
            Page = 1,
            TotalPages = 1,
            TotalResults = data.Count()
        };
    }

    public MoviesController(ApplicationDbContext context, ITMDBService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }
    
    // GET: api/movies/tmdb/{tmdbId}
    [HttpGet("tmdb/{tmdbId}")]
    public async Task<ActionResult<MovieDto>> GetMovieByTMDBId(int tmdbId)
    {
        try
        {
            var movie = await _tmdbService.GetMovieByIdAsync(tmdbId);
            
            if (movie == null)
            {
                return NotFound($"Movie with TMDB ID {tmdbId} not found");
            }
            movie.Keywords = movie.KeywordsNames;
            movie.ProductionCompanies = movie.ProductionCompaniesNames;

            return Ok(movie);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching movie details: {ex.Message}");
        }
    }

    // GET: api/movies/popular
    [HttpGet("popular")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetPopularMovies([FromQuery] int page = 1)
    {
        try
        {
            var result = await _tmdbService.GetPopularMoviesAsync(page);
            return Ok(new DefaultResponse
            {
                Data = result.Movies,
                Page = result.Page,
                TotalPages = result.TotalPages,
                TotalResults = result.TotalResults
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching popular movies: {ex.Message}");
        }
    }

    // GET: api/movies/trending
    [HttpGet("trending")]
    public async Task<ActionResult<DefaultResponse>> GetTrendingMovies(int page = 1)
    {
        try
        {
            var result = await _tmdbService.GetTheatreMoviesAsync(page);
            return Ok(new DefaultResponse
            {
                Data = result.Movies,
                Page = result.Page,
                TotalPages = result.TotalPages,
                TotalResults = result.TotalResults
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching trending movies: {ex.Message}");
        }
    }

    // GET: api/movies/top-rated
    [HttpGet("top-rated")]
    public async Task<ActionResult<DefaultResponse>> GetTopRatedMovies([FromQuery] int page = 1)
    {
        try
        {
            var result = await _tmdbService.GetTopRatedMoviesAsync(page);
            return Ok(new DefaultResponse
            {
                Data = result.Movies,
                Page = result.Page,
                TotalPages = result.TotalPages,
                TotalResults = result.TotalResults
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching top rated movies: {ex.Message}");
        }
    }

    // GET: api/movies/text-search?q=query
    [HttpGet("text-search")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> TextSearchMovies(
        [FromQuery] string q,
        [FromQuery] int page = 1)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return BadRequest("Search query is required");
            }

            var result = await _tmdbService.SearchMoviesAsync(q, page);
            return Ok(new DefaultResponse
            {
                Data = result.Movies,
                Page = result.Page,
                TotalPages = result.TotalPages,
                TotalResults = result.TotalResults
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error searching movies: {ex.Message}");
        }
    }

    // GET: api/movies/discover
    [HttpGet("discover")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> DiscoverMovies(
        [FromQuery] List<int>? genres,
        [FromQuery] int? releaseYear,
        [FromQuery] double? minRating,
        [FromQuery] int? minVoteCount,
        [FromQuery] int page = 1,
        [FromQuery] bool? adult = null,
        [FromQuery] string? sortBy = null)
    {
        try
        {
            // Create the discover request with enhanced filters and defaults
            var discoverRequest = new DiscoverMoviesRequest
            {
                Genres = genres, // Support multiple genres
                ReleaseDateFrom = releaseYear.HasValue ? $"{releaseYear.Value}-01-01" : null, // Convert year to date
                MinRating = minRating,
                Adult = adult ?? true, // Default to true if not provided
                SortBy = sortBy ?? "popularity", // Default sort if not provided
                SortOrder = "desc", // Always descending
                MinVoteCount = minVoteCount ?? 10, // Default to 10
                Page = page
            };

            var result = await _tmdbService.DiscoverMoviesAsync(discoverRequest);
            return Ok(new DefaultResponse
            {
                Data = result.Movies,
                Page = result.Page,
                TotalPages = result.TotalPages,
                TotalResults = result.TotalResults
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error discovering movies: {ex.Message}");
        }
    }

    // GET: api/movies/genre/{genreId}
    [HttpGet("genre/{genreId}")]
    public async Task<ActionResult<DefaultResponse>> GetMoviesByGenre(int genreId, [FromQuery] int page = 1)
    {
        try
        {
            var movies = await _tmdbService.GetMoviesByGenreAsync(genreId, page);
            return Ok(CreateUIResponse(movies));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching movies by genre: {ex.Message}");
        }
    }

    // GET: api/movies/{id}/recommendations
    [HttpGet("{id}/recommendations")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetRecommendations(int id)
    {
        try
        {
            var recommendations = await _tmdbService.GetRecommendationsAsync(id);
            return Ok(CreateUIResponse(recommendations));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching recommendations: {ex.Message}");
        }
    }

    [HttpGet("{id}/similar")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetSimilarMovies(int id)
    {
        try
        {
            var similarMovies = await _tmdbService.GetSimilarMoviesAsync(id);
            return Ok(CreateUIResponse(similarMovies));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching similar movies: {ex.Message}");
        }
    }

    // DELETE: api/movies/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null)
        {
            return NotFound();
        }

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


