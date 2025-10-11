# 🎬 Movie Recommendation System

A full-stack movie recommendation platform with personalized content-based filtering, built with .NET 8.0 Web API backend and React TypeScript frontend.

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication with secure login/register
- User profile management with password updates
- Account deletion with confirmation

### 🎭 Movie Discovery
- **Trending Movies** - Currently in theatres with pagination
- **Popular Movies** - Most popular movies with pagination  
- **Top Rated Movies** - Highest rated movies with pagination
- **Personalized Recommendations** - AI-powered suggestions based on user preferences
- **Advanced Search** - Text search and filter-based discovery with multiple criteria

### 📱 Interactive Features
- **Like/Dislike System** - Heart (like) and thumbs down (dislike) buttons
- **Watchlist Management** - Save movies for later viewing
- **Movie Details** - Comprehensive movie information with genres, production companies, keywords
- **Trailer Integration** - YouTube trailer playback in modal
- **Responsive Design** - Mobile-friendly UI with Material-UI components

### 🤖 Smart Recommendations
- **Content-Based Filtering** - Analyzes user's liked movies
- **Multi-Factor Scoring** - Genres (30%), Production Companies (20%), Keywords (15%), Rating (15%), Year (10%), Popularity (10%)
- **Preference Learning** - Builds user profiles from interaction history
- **Adaptive Algorithm** - Recommendations improve as users interact more

## 🛠️ Tech Stack

### Backend
- **.NET 8.0 Web API** - RESTful API with Swagger documentation
- **PostgreSQL / SQL Server** - Flexible database provider with Entity Framework Core
- **JWT Authentication** - Secure token-based authentication
- **TMDB API Integration** - Real-time movie data, images, and metadata

### Frontend
- **React 18** with TypeScript - Modern UI framework
- **Redux Toolkit** - State management with RTK Query
- **Material-UI (MUI)** - Professional component library
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- **Database**: PostgreSQL OR SQL Server (configurable)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Backend Setup

1. **Clone and configure**:
```bash
cd MovieRecommendationBackend
cp appsettings.Development.json appsettings.json
```

2. **Configure Database Provider** - Choose PostgreSQL or SQL Server:
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=MovieRecommendationDB;Username=your_username;Password=your_password",
    "SqlServer": "Server=localhost;Database=MovieRecommendationDB;User Id=sa;Password=YourPassword123;TrustServerCertificate=True;"
  }
}
```

3. **Complete `appsettings.json` configuration**:
```json
{
  "DatabaseProvider": "PostgreSQL",
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=MovieRecommendationDB;Username=your_username;Password=your_password",
    "SqlServer": "Server=localhost;Database=MovieRecommendationDB;UserId=sa;Password=YourPassword123;TrustServerCertificate=True;"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-here-minimum-32-characters",
    "Issuer": "MovieRecommendationAPI",
    "Audience": "MovieRecommendationClient"
  },
  "TMDB": {
    "ApiKey": "your_tmdb_api_key_here",
    "BaseUrl": "https://api.themoviedb.org/3"
  }
}
```

4. **Setup database and run**:
```bash
dotnet ef database update
dotnet run
```

### Frontend Setup

1. **Install dependencies and run**:
```bash
cd movie-recommendation-frontend
npm install
npm run dev
```

2. **Access the application**:
- Frontend: `http://localhost:5173`
- Backend API: `https://localhost:7000`
- Swagger UI: `https://localhost:7000/swagger`

## 📡 Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Movies & Discovery
- `GET /api/movies/trending` - Trending movies
- `GET /api/movies/popular?page={page}` - Popular movies (paginated)
- `GET /api/movies/top-rated?page={page}` - Top rated movies (paginated)
- `GET /api/movies/tmdb/{tmdbId}` - Movie details with videos
- `GET /api/movies/text-search?q={query}&page={page}` - Text search
- `GET /api/movies/discover` - Advanced filtering with multiple parameters

### User Interactions
- `GET /api/watchlist` - User's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/{movieId}` - Remove from watchlist
- `GET /api/likelist` - User's liked/disliked movies
- `POST /api/likelist` - Like/dislike a movie
- `DELETE /api/likelist/{movieId}` - Remove like/dislike

### Recommendations
- `GET /api/recommendations/personalized?page={page}` - AI recommendations
- `GET /api/recommendations/user-data` - User preference analysis

## 🎯 Advanced Features

### Smart Recommendation Engine
- **User Profile Analysis** - Extracts preferences from liked movies
- **Multi-Dimensional Scoring** - Considers genres, studios, themes, ratings, and years
- **Production Company Matching** - Recommends movies from preferred studios
- **Keyword Analysis** - Matches movies with similar themes and concepts
- **Avoidance Patterns** - Learns what users don't like

### Enhanced Search & Discovery
- **Tabbed Search Interface** - Separate text search and advanced filters
- **Multiple Genre Selection** - Checkbox-based genre filtering
- **Production Company Filters** - Filter by studio preferences
- **Keyword-Based Discovery** - Find movies by themes and concepts
- **Pagination Support** - Efficient browsing with page controls

### Rich Movie Information
- **Comprehensive Details** - Genres, production companies, keywords, cast info
- **Visual Elements** - High-quality posters, backdrops, and trailers
- **Interactive UI** - Like/dislike buttons, watchlist management, trailer playback

## 🔧 Development

### Database Migrations

**For PostgreSQL:**
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

**For SQL Server:**
```bash
# First, set DatabaseProvider to "SqlServer" in appsettings.json
dotnet ef migrations add MigrationName
dotnet ef database update
```

> **⚠️ Important**: Migrations are database-specific. If you switch providers, you may need to regenerate migrations or maintain separate migration folders for each provider.

### Frontend Build
```bash
npm run build
npm run preview
```

### Project Structure
```
MovieRecommendationSystem/
├── MovieRecommendationBackend/     # .NET 8.0 Web API
│   ├── Controllers/               # API endpoints
│   ├── Services/                  # Business logic & TMDB integration
│   ├── Models/                    # Database entities
│   ├── DTOs/                      # Data transfer objects
│   └── Data/                      # Database context
└── movie-recommendation-frontend/  # React TypeScript app
    ├── src/
    │   ├── components/            # Reusable UI components
    │   ├── pages/                 # Main application pages
    │   ├── services/              # API integration
    │   ├── store/                 # Redux state management
    │   └── types/                 # TypeScript definitions
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - BCrypt for secure password storage
- **CORS Configuration** - Proper cross-origin resource sharing
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Entity Framework parameterized queries

## 🎨 UI/UX Highlights

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** - Modern dark UI with custom color palette
- **Smooth Animations** - Hover effects, transitions, and loading states
- **Intuitive Navigation** - Easy-to-use interface with clear visual hierarchy
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support

## 📊 Performance Optimizations

- **Lazy Loading** - Images and components load as needed
- **Pagination** - Efficient data loading with page-based navigation
- **Caching** - TMDB genre caching and optimized API calls
- **Code Splitting** - Optimized bundle sizes for faster loading
- **Responsive Images** - Multiple image sizes for different screen resolutions

## 🚀 Future Enhancements

- [ ] Collaborative filtering for user-to-user recommendations
- [ ] Social features (reviews, friend recommendations)
- [ ] Mobile app with React Native
- [ ] Advanced analytics and user insights
- [ ] Machine learning model improvements
- [ ] Real-time notifications
- [ ] Content moderation and admin panel

## 📄 License

MIT License - feel free to use this project for learning and development!

---

**Built with ❤️ using modern web technologies for the ultimate movie discovery experience!** 🎬✨