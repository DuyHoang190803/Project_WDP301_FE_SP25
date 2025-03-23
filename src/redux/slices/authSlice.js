import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import AuthApi from '../../api/AuthApi';
import { jwtDecode } from 'jwt-decode';

// Lấy accessToken từ cookie và giải mã để khởi tạo userInfo
const accessToken = Cookies.get('accessToken');
const initialUserInfo = accessToken ? jwtDecode(accessToken)?.user : null;

// Async thunk cho login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await AuthApi.login(email, password);
      const accessToken = Cookies.get('accessToken');
      let user = null;
      if (accessToken) {
        user = jwtDecode(accessToken)?.user;
      }
      return { ...response.data, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk cho login với Google
export const loginWithGoogleAccount = createAsyncThunk(
  'auth/loginWithGoogleAccount',
  async (token, { rejectWithValue }) => {
    try {
      const response = await AuthApi.loginWithGoogleAccount(token);
      const accessToken = Cookies.get('accessToken');
      let user = null;
      if (accessToken) {
        user = jwtDecode(accessToken).user;
      }
      return { ...response.data, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk cho logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthApi.logout();
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk cho refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthApi.refreshToken();
      const accessToken = Cookies.get('accessToken');
      let user = null;
      if (accessToken) {
        user = jwtDecode(accessToken)?.user;
      }
      return { ...response.data, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk cho restore user từ token khi khởi động
export const restoreUserFromToken = createAsyncThunk(
  "auth/restoreUserFromToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        throw new Error("Please login to continue");
      }

      const decoded = jwtDecode(refreshToken);
      const user = decoded?.user;
      if (!user) {
        throw new Error("Invalid refresh token payload");
      }

      // Nếu chưa có accessToken, gọi API để refresh
      let accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        const response = await AuthApi.refreshToken();
        console.log("Refresh token response:", response);
        
        accessToken = response?.data?.accessToken;
        
        if (!accessToken) {
          throw new Error("Failed to refresh access token");
        }

        Cookies.set("accessToken", accessToken, { secure: true, sameSite: "Strict" });
        console.log("New accessToken:", accessToken);
      }

      return { user };
    } catch (error) {
      // Xóa token không hợp lệ nếu có lỗi
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      return rejectWithValue(error.message || "Failed to restore user from token");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: initialUserInfo || null,
    isAuthenticated: !!accessToken,
    loading: false,
    error: null,
    isRestoring: true, // Thêm trạng thái để kiểm tra khôi phục
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRestoringComplete: (state) => {
      state.isRestoring = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login handlers
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload?.user;
        state.isRestoring = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
        state.isRestoring = false;
      })

      // Login with Google handlers
      .addCase(loginWithGoogleAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload?.user;
        state.isRestoring = false;
      })
      .addCase(loginWithGoogleAccount.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Google login failed';
        state.isRestoring = false;
      })

      // Logout handlers
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.isRestoring = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      })

      // Refresh token handlers
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload?.user;
        state.isRestoring = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.error = action.payload || 'Refresh token failed';
        state.isRestoring = false;
      })

      // Restore user from token handlers
      .addCase(restoreUserFromToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRestoring = true;
      })
      .addCase(restoreUserFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload.user;
        state.isRestoring = false;
      })
      .addCase(restoreUserFromToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.error = action.payload || 'Failed to restore user';
        state.isRestoring = false;
      });
  },
});

export const { clearError, setRestoringComplete } = authSlice.actions;
export default authSlice.reducer;