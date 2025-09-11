import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginForm, RegisterForm } from '../../types';
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
  async (credentials: LoginForm) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.token);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterForm) => {
    const response = await authApi.register(userData);
    localStorage.setItem('token', response.token);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: number) => {
    const response = await authApi.getUserProfile(userId);
    return response;
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, userData }: { userId: number; userData: Partial<User> }) => {
    const response = await authApi.updateUserProfile(userId, userData);
    return response;
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (userId: number) => {
    await authApi.deleteAccount(userId);
    localStorage.removeItem('token');
    return null;
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
        state.loading.error = action.error.message;
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
        state.loading.error = action.error.message;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Fetch user profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Update user profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;

