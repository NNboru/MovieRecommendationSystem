import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const WatchlistPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        My Watchlist
      </Typography>
      <Box>
        <Typography variant="body1">
          Watchlist page will show:
        </Typography>
        <ul>
          <li>Movies added to watchlist</li>
          <li>Add/remove functionality</li>
          <li>Organize by categories</li>
          <li>Mark as watched/unwatched</li>
        </ul>
      </Box>
    </Container>
  );
};

export default WatchlistPage;

