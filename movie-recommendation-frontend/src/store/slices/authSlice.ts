import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginForm, RegisterForm, UpdateProfileForm, ChangePasswordForm } from '../../types';
import { authApi } from '../../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: {
    isLoading: boolean;
    error?: string;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('token'),
  loading: {
    isLoading: false,
  },
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginForm, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.token);
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterForm, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.token);
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: UpdateProfileForm, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: ChangePasswordForm, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.deleteAccount();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.loading.error = undefined;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
        // If token is invalid, clear auth state
        if (action.payload === 'Invalid token') {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = undefined;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;

