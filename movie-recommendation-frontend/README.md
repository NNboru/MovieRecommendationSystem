# Movie Recommendation Frontend

A modern React TypeScript frontend for the Movie Recommendation System, built with Vite, Redux Toolkit, and Material-UI.

## Features

- **Modern React Setup** - Built with Vite for fast development and builds
- **TypeScript** - Full type safety throughout the application
- **Redux Toolkit** - State management for movies, authentication, and UI
- **Material-UI** - Beautiful, responsive UI components with dark theme
- **React Router** - Client-side routing between pages
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - UI component library
- **React Router** - Routing
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:5233`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── home/           # Homepage components
│   ├── layout/         # Layout components (Navbar, etc.)
│   ├── movies/         # Movie-related components
│   └── ui/             # Generic UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── store/              # Redux store and slices
└── types/              # TypeScript type definitions
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5233/api`. All TMDB API calls are handled by the backend to keep API keys secure.

### Key API Endpoints

- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/top-rated` - Get top-rated movies
- `GET /api/movies/search` - Search movies with filters
- `GET /api/movies/{id}` - Get movie details
- `GET /api/genres` - Get movie genres

## Features Implemented

- ✅ **Homepage** with trending, popular, and top-rated movies
- ✅ **Hero Section** with rotating movie carousel
- ✅ **Movie Cards** with hover effects and watchlist buttons
- ✅ **Responsive Design** for all screen sizes
- ✅ **Dark Theme** with modern Material-UI styling
- ✅ **Navigation Bar** with search functionality
- ✅ **Redux State Management** for all app state

## Features To Be Implemented

- 🔄 **Movie Details Page** - Detailed movie information
- 🔄 **Search Functionality** - Advanced search with filters
- 🔄 **Authentication** - Login/signup forms
- 🔄 **Watchlist** - Add/remove movies functionality
- 🔄 **User Profile** - Account management

## Development Notes

- The app uses a dark theme by default
- All API calls go through the backend to keep TMDB API keys secure
- State is managed with Redux Toolkit for predictable state updates
- Components are built with Material-UI for consistent design
- TypeScript provides type safety throughout the application

## Contributing

1. Make sure the backend is running on `http://localhost:5233`
2. Install dependencies with `npm install`
3. Start the dev server with `npm run dev`
4. Make your changes and test thoroughly
5. Build the project with `npm run build` to ensure no errors