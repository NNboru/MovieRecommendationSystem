import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
        Sign Up
      </Typography>
      <Box>
        <Typography variant="body1">
          Registration form will include:
        </Typography>
        <ul>
          <li>Username, email, password fields</li>
          <li>Optional: First name, last name, date of birth</li>
          <li>Form validation</li>
          <li>Account creation with backend</li>
        </ul>
      </Box>
    </Container>
  );
};

export default RegisterPage;

