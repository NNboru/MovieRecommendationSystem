# Movie Recommendation System

A .NET 8.0 Web API backend for a movie recommendation system with PostgreSQL database and TMDB integration.

## Features

- **Movie Management**: CRUD operations for movies with TMDB integration
- **User Management**: User registration, authentication, and profile management
- **Rating System**: Users can rate movies and leave comments
- **Recommendation Engine**: Get movie recommendations based on TMDB data
- **Genre Support**: Movie categorization by genres
- **Search Functionality**: Search movies by title, genre, and popularity

## Tech Stack

- **Backend**: .NET 8.0 Web API
- **Database**: PostgreSQL with Entity Framework Core
- **External API**: The Movie Database (TMDB) for movie data
- **Authentication**: Basic password hashing (SHA256)
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- .NET 8.0 SDK
- PostgreSQL database
- TMDB API key (get one at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MovieRecommendationSystem/MovieRecommendationBackend
```

### 2. Configure Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE MovieRecommendationDB;
```

2. Update `appsettings.json` with your database connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MovieRecommendationDB;Username=your_username;Password=your_password"
  }
}
```

### 3. Configure TMDB API

1. Get your TMDB API key from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Update `appsettings.json` with your API key:
```json
{
  "TMDB": {
    "ApiKey": "your_actual_tmdb_api_key_here",
    "BaseUrl": "https://api.themoviedb.org/3"
  }
}
```

### 4. Install Dependencies

```bash
dotnet restore
```

### 5. Run the Application

```bash
dotnet run
```

The API will be available at `https://localhost:7000` (or the port shown in your terminal).

## API Endpoints

### Movies

- `GET /api/movies` - Get all movies (paginated)
- `GET /api/movies/{id}` - Get movie by ID
- `GET /api/movies/popular` - Get popular movies from TMDB
- `GET /api/movies/search?q={query}` - Search movies
- `GET /api/movies/genre/{genreId}` - Get movies by genre
- `GET /api/movies/{id}/recommendations` - Get movie recommendations
- `POST /api/movies` - Create a new movie
- `PUT /api/movies/{id}` - Update a movie
- `DELETE /api/movies/{id}` - Delete a movie

### Users

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/{id}` - Update a user
- `DELETE /api/users/{id}` - Delete a user
- `GET /api/users/{id}/ratings` - Get user's ratings

### Ratings

- `GET /api/ratings` - Get all ratings
- `GET /api/ratings/{id}` - Get rating by ID
- `GET /api/ratings/movie/{movieId}` - Get ratings for a specific movie
- `POST /api/ratings?userId={id}&movieId={id}` - Create a rating
- `PUT /api/ratings/{id}` - Update a rating
- `DELETE /api/ratings/{id}` - Delete a rating
- `GET /api/ratings/average/movie/{movieId}` - Get average rating for a movie

## Database Schema

The system includes the following entities:

- **Movies**: Movie information with TMDB integration
- **Genres**: Movie genres
- **Users**: User accounts and profiles
- **Ratings**: User movie ratings and comments
- **MovieGenres**: Many-to-many relationship between movies and genres

## Usage Examples

### Create a User

```bash
curl -X POST "https://localhost:7000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Rate a Movie

```bash
curl -X POST "https://localhost:7000/api/ratings?userId=1&movieId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 5,
    "comment": "Great movie! Highly recommended."
  }'
```

### Get Popular Movies

```bash
curl "https://localhost:7000/api/movies/popular"
```

### Search Movies

```bash
curl "https://localhost:7000/api/movies/search?q=inception"
```

## Development

### Adding New Features

1. Create models in the `Models` folder
2. Add DTOs in the `DTOs` folder
3. Update `ApplicationDbContext` if needed
4. Create controllers in the `Controllers` folder
5. Add services in the `Services` folder if needed

### Database Migrations

When you make changes to the models:

```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Security Notes

- Passwords are hashed using SHA256 (consider using bcrypt or Argon2 for production)
- CORS is configured to allow all origins (restrict this in production)
- No authentication middleware implemented (add JWT or similar for production)

## Next Steps

- Implement proper authentication and authorization
- Add more sophisticated recommendation algorithms
- Create a React frontend
- Add unit tests
- Implement caching for TMDB API calls
- Add rate limiting
- Implement logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
