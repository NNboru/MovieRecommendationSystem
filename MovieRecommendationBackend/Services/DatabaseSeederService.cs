using Microsoft.EntityFrameworkCore;
using MovieRecommendationBackend.Data;
using MovieRecommendationBackend.Models;

namespace MovieRecommendationBackend.Services;

public class DatabaseSeederService
{
    private readonly ApplicationDbContext _context;

    public DatabaseSeederService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Seed genres if they don't exist
        if (!_context.Genres.Any())
        {
            var genres = new List<Genre>
            {
                new Genre { Name = "Action", TMDBId = 28 },
                new Genre { Name = "Adventure", TMDBId = 12 },
                new Genre { Name = "Animation", TMDBId = 16 },
                new Genre { Name = "Comedy", TMDBId = 35 },
                new Genre { Name = "Crime", TMDBId = 80 },
                new Genre { Name = "Documentary", TMDBId = 99 },
                new Genre { Name = "Drama", TMDBId = 18 },
                new Genre { Name = "Family", TMDBId = 10751 },
                new Genre { Name = "Fantasy", TMDBId = 14 },
                new Genre { Name = "History", TMDBId = 36 },
                new Genre { Name = "Horror", TMDBId = 27 },
                new Genre { Name = "Music", TMDBId = 10402 },
                new Genre { Name = "Mystery", TMDBId = 9648 },
                new Genre { Name = "Romance", TMDBId = 10749 },
                new Genre { Name = "Science Fiction", TMDBId = 878 },
                new Genre { Name = "TV Movie", TMDBId = 10770 },
                new Genre { Name = "Thriller", TMDBId = 53 },
                new Genre { Name = "War", TMDBId = 10752 },
                new Genre { Name = "Western", TMDBId = 37 }
            };

            _context.Genres.AddRange(genres);
            await _context.SaveChangesAsync();
        }

        // Seed sample users if they don't exist
        if (!_context.Users.Any())
        {
            var users = new List<User>
            {
                new User
                {
                    Username = "admin",
                    Email = "rohan.rawat.9897@gmail.com",
                    PasswordHash = "jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=", // "admin123"
                    FirstName = "Admin",
                    LastName = "User"
                },
                new User
                {
                    Username = "Rohan Rawat",
                    Email = "rohan.rawat.9897@gmail.com",
                    PasswordHash = "XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=", // "password123"
                    FirstName = "Rohan",
                    LastName = "Rawat"
                }
            };

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();
        }

        // Seed sample movies if they don't exist
        if (!_context.Movies.Any())
        {
            var actionGenre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == "Action");
            var dramaGenre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == "Drama");
            var sciFiGenre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == "Science Fiction");

            var movies = new List<Movie>
            {
                new Movie
                {
                    Title = "The Matrix",
                    Overview = "A computer programmer discovers a mysterious world.",
                    ReleaseDate = "1999-03-31",
                    VoteAverage = 8.7,
                    VoteCount = 2000000,
                    PosterPath = "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                    BackdropPath = "/ncF4HivY2s6WpqEoJOJfQfhvNXT.jpg",
                    TMDBId = 603,
                    IsAdult = false,
                    OriginalLanguage = "en",
                    OriginalTitle = "The Matrix",
                    Popularity = 100.0
                },
                new Movie
                {
                    Title = "Inception",
                    Overview = "A thief who steals corporate secrets through dream-sharing technology.",
                    ReleaseDate = "2010-07-16",
                    VoteAverage = 8.8,
                    VoteCount = 2500000,
                    PosterPath = "/9gk7adHYeDvHkCSEqAvQNLV5Uga.jpg",
                    BackdropPath = "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                    TMDBId = 27205,
                    IsAdult = false,
                    OriginalLanguage = "en",
                    OriginalTitle = "Inception",
                    Popularity = 95.0
                }
            };

            _context.Movies.AddRange(movies);
            await _context.SaveChangesAsync();

            // Add genres to movies
            if (actionGenre != null && sciFiGenre != null)
            {
                var matrix = await _context.Movies.FirstOrDefaultAsync(m => m.Title == "The Matrix");
                var inception = await _context.Movies.FirstOrDefaultAsync(m => m.Title == "Inception");

                if (matrix != null)
                {
                    matrix.MovieGenres.Add(new MovieGenre { Genre = actionGenre });
                    matrix.MovieGenres.Add(new MovieGenre { Genre = sciFiGenre });
                }

                if (inception != null)
                {
                    inception.MovieGenres.Add(new MovieGenre { Genre = actionGenre });
                    inception.MovieGenres.Add(new MovieGenre { Genre = sciFiGenre });
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}
