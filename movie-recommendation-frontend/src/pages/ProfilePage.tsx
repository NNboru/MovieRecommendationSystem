import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile, changePassword, deleteAccount, clearError } from '../store/slices/authSlice';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    }
  }, [user]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Clear password error when user starts typing
    if (name === 'confirmNewPassword' || name === 'newPassword') {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile(profileData));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    dispatch(changePassword(passwordData));
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = () => {
    dispatch(deleteAccount());
    setDeleteDialogOpen(false);
    navigate('/');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Profile Information */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Profile Information
        </Typography>

        <Box component="form" onSubmit={handleUpdateProfile}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                margin="normal"
                required
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                margin="normal"
                required
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={handleProfileChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Profile'}
          </Button>
        </Box>
      </Paper>

      {/* Change Password */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Change Password
        </Typography>

        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleChangePassword}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmNewPassword"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                margin="normal"
                required
              />
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </Box>
      </Paper>

      {/* Danger Zone */}
      <Paper elevation={3} sx={{ p: 4, border: '2px solid #f44336' }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, color: '#f44336' }}>
          Danger Zone
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          Delete Account
        </Button>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;