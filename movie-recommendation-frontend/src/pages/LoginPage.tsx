import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
        Login
      </Typography>
      <Box>
        <Typography variant="body1">
          Login form will be implemented here with:
        </Typography>
        <ul>
          <li>Email and password fields</li>
          <li>Form validation</li>
          <li>Authentication with backend</li>
          <li>Redirect to previous page after login</li>
        </ul>
      </Box>
    </Container>
  );
};

export default LoginPage;

