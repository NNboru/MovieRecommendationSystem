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

    // GET: api/movies
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetMovies([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var skip = (page - 1) * pageSize;
        
        var movies = await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var movieDtos = movies.Select(MapToMovieDto).ToList();
        return Ok(movieDtos);
    }


    // GET: api/movies/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetMovie(int id)
    {
        var movie = await _context.Movies
            .Include(m => m.MovieGenres)
            .ThenInclude(mg => mg.Genre)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (movie == null)
        {
            return NotFound();
        }

        return MapToMovieDto(movie);
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
            var movies = await _tmdbService.GetPopularMoviesAsync(page);
            return Ok(CreateUIResponse(movies));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching popular movies: {ex.Message}");
        }
    }

    // GET: api/movies/trending
    [HttpGet("trending")]
    public async Task<ActionResult<DefaultResponse>> GetTrendingMovies([FromQuery] int page = 1)
    {
        try
        {
            var movies = await _tmdbService.GetTrendingMoviesAsync(page);
            return Ok(CreateUIResponse(movies));
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
            var movies = await _tmdbService.GetTopRatedMoviesAsync(page);
            return Ok(CreateUIResponse(movies));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching top rated movies: {ex.Message}");
        }
    }

    // GET: api/movies/search?q=query
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<MovieDto>>> SearchMovies(
        [FromQuery] string? q, 
        [FromQuery] int? genre,
        [FromQuery] string? releaseDateFrom,
        [FromQuery] string? releaseDateTo,
        [FromQuery] string? language,
        [FromQuery] double? minRating,
        [FromQuery] double? maxRating,
        [FromQuery] int? year,
        [FromQuery] int? minRuntime,
        [FromQuery] int? maxRuntime,
        [FromQuery] bool? adult,
        [FromQuery] string? certification,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        [FromQuery] int page = 1)
    {
        try
        {
            // Create the discover request with all filters
            var discoverRequest = new DiscoverMoviesRequest
            {
                Query = q,
                Genre = genre,
                ReleaseDateFrom = releaseDateFrom,
                ReleaseDateTo = releaseDateTo,
                Language = language,
                MinRating = minRating,
                MaxRating = maxRating,
                Year = year,
                MinRuntime = minRuntime,
                MaxRuntime = maxRuntime,
                Adult = adult,
                Certification = certification,
                SortBy = sortBy,
                SortOrder = sortOrder,
                Page = page
            };

            // Use the discover endpoint for all search functionality
            var movies = await _tmdbService.DiscoverMoviesAsync(discoverRequest);

            return Ok(CreateUIResponse(movies));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error searching movies: {ex.Message}");
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
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null)
        {
            return NotFound();
        }

        try
        {
            var recommendations = await _tmdbService.GetRecommendationsAsync(movie.TMDBId);
            return Ok(CreateUIResponse(recommendations));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching recommendations: {ex.Message}");
        }
    }

    // POST: api/movies
    [HttpPost]
    public async Task<ActionResult<MovieDto>> CreateMovie(CreateMovieDto createMovieDto)
    {
        var movie = new Movie
        {
            Title = createMovieDto.Title,
            Overview = createMovieDto.Overview,
            ReleaseDate = createMovieDto.ReleaseDate,
            VoteAverage = createMovieDto.VoteAverage,
            VoteCount = createMovieDto.VoteCount,
            PosterPath = createMovieDto.PosterPath,
            BackdropPath = createMovieDto.BackdropPath,
            TMDBId = createMovieDto.TMDBId,
            IsAdult = createMovieDto.IsAdult,
            OriginalLanguage = createMovieDto.OriginalLanguage,
            OriginalTitle = createMovieDto.OriginalTitle,
            Popularity = createMovieDto.Popularity
        };

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        // Add genres if provided
        if (createMovieDto.GenreIds.Any())
        {
            var genres = await _context.Genres
                .Where(g => createMovieDto.GenreIds.Contains(g.Id))
                .ToListAsync();

            foreach (var genre in genres)
            {
                movie.MovieGenres.Add(new MovieGenre { Genre = genre });
            }
            await _context.SaveChangesAsync();
        }

        await _context.Entry(movie)
            .Collection(m => m.MovieGenres)
            .Query()
            .Include(mg => mg.Genre)
            .LoadAsync();

        return CreatedAtAction(nameof(GetMovie), new { id = movie.TMDBId }, MapToMovieDto(movie));
    }

    // PUT: api/movies/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMovie(int id, CreateMovieDto updateMovieDto)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null)
        {
            return NotFound();
        }

        movie.Title = updateMovieDto.Title;
        movie.Overview = updateMovieDto.Overview;
        movie.ReleaseDate = updateMovieDto.ReleaseDate;
        movie.VoteAverage = updateMovieDto.VoteAverage;
        movie.VoteCount = updateMovieDto.VoteCount;
        movie.PosterPath = updateMovieDto.PosterPath;
        movie.BackdropPath = updateMovieDto.BackdropPath;
        movie.TMDBId = updateMovieDto.TMDBId;
        movie.IsAdult = updateMovieDto.IsAdult;
        movie.OriginalLanguage = updateMovieDto.OriginalLanguage;
        movie.OriginalTitle = updateMovieDto.OriginalTitle;
        movie.Popularity = updateMovieDto.Popularity;
        movie.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MovieExists(movie.TMDBId))
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

    private bool MovieExists(int id)
    {
        return _context.Movies.Any(e => e.Id == id);
    }

    private static MovieDto MapToMovieDto(Movie movie)
    {
        return new MovieDto
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
            UpdatedAt = movie.UpdatedAt
        };
    }
}


