import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SearchPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Search Movies
      </Typography>
      <Box>
        <Typography variant="body1">
          This page will include:
        </Typography>
        <ul>
          <li>Search functionality with TMDB integration</li>
          <li>Advanced filters (genre, release date, language, rating)</li>
          <li>Search results with pagination</li>
          <li>Sorting options</li>
        </ul>
      </Box>
    </Container>
  );
};

export default SearchPage;

