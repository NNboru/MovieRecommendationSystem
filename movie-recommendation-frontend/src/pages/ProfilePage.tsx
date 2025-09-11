import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Profile
      </Typography>
      <Box>
        <Typography variant="body1">
          Profile page will include:
        </Typography>
        <ul>
          <li>User information display and editing</li>
          <li>Account settings</li>
          <li>Password reset functionality</li>
          <li>Account deletion option</li>
        </ul>
      </Box>
    </Container>
  );
};

export default ProfilePage;

