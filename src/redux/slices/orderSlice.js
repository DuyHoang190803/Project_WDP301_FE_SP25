import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import OrderApi from "../../api/OrderApi";

// Trạng thái ban đầu của orders
const initialState = {
  orders: [],
  orderDetail: null,
  totalOrders: 0,
  page: 1,        // Trang hiện tại
  pageSize: 10,   // Số đơn hàng mỗi trang
  totalPages: 0,  // Tổng số trang
  loading: false,
  error: null,
};

// Async thunk để fetch danh sách đơn hàng với phân trang
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ status, query = "", page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await OrderApi?.getOrderList(status, query, page, pageSize);
      console.log("response", response?.data);

      return {
        orders: response?.data?.rows || [],
        totalOrders: response?.data?.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil(response?.data?.count / pageSize),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

// Async thunk để fetch chi tiết đơn hàng
export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOrderDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await OrderApi?.getOrderDetail(orderId);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage } = orderSlice.actions;
export default orderSlice.reducer;