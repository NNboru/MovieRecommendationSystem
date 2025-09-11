import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  searchModalOpen: boolean;
  filterModalOpen: boolean;
  notifications: Notification[];
  loading: {
    global: boolean;
    search: boolean;
    filters: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: false,
  searchModalOpen: false,
  filterModalOpen: false,
  notifications: [],
  loading: {
    global: false,
    search: false,
    filters: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen;
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.searchModalOpen = action.payload;
    },
    toggleFilterModal: (state) => {
      state.filterModalOpen = !state.filterModalOpen;
    },
    setFilterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.filterModalOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.search = action.payload;
    },
    setFilterLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.filters = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleSearchModal,
  setSearchModalOpen,
  toggleFilterModal,
  setFilterModalOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setSearchLoading,
  setFilterLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

