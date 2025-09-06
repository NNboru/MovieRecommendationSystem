using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GenresController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/genres
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetGenres()
    {
        var genres = await _context.Genres
            .Select(g => new
            {
                g.Id,
                g.Name,
                g.TMDBId,
                g.CreatedAt,
                g.UpdatedAt
            })
            .ToListAsync();

        return Ok(genres);
    }

    // GET: api/genres/5
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetGenre(int id)
    {
        var genre = await _context.Genres.FindAsync(id);

        if (genre == null)
        {
            return NotFound();
        }

        var genreDto = new
        {
            genre.Id,
            genre.Name,
            genre.TMDBId,
            genre.CreatedAt,
            genre.UpdatedAt
        };

        return Ok(genreDto);
    }

    // POST: api/genres
    [HttpPost]
    public async Task<ActionResult<object>> CreateGenre([FromBody] CreateGenreDto createGenreDto)
    {
        if (await _context.Genres.AnyAsync(g => g.Name == createGenreDto.Name))
        {
            return BadRequest("Genre with this name already exists");
        }

        var genre = new Genre
        {
            Name = createGenreDto.Name,
            TMDBId = createGenreDto.TMDBId
        };

        _context.Genres.Add(genre);
        await _context.SaveChangesAsync();

        var genreDto = new
        {
            genre.Id,
            genre.Name,
            genre.TMDBId,
            genre.CreatedAt,
            genre.UpdatedAt
        };

        return CreatedAtAction(nameof(GetGenre), new { id = genre.Id }, genreDto);
    }

    // PUT: api/genres/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] CreateGenreDto updateGenreDto)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null)
        {
            return NotFound();
        }

        if (await _context.Genres.AnyAsync(g => g.Name == updateGenreDto.Name && g.Id != id))
        {
            return BadRequest("Genre with this name already exists");
        }

        genre.Name = updateGenreDto.Name;
        genre.TMDBId = updateGenreDto.TMDBId;
        genre.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!GenreExists(id))
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

    // DELETE: api/genres/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null)
        {
            return NotFound();
        }

        _context.Genres.Remove(genre);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool GenreExists(int id)
    {
        return _context.Genres.Any(e => e.Id == id);
    }
}

public class CreateGenreDto
{
    public string Name { get; set; } = string.Empty;
    public int? TMDBId { get; set; }
}


