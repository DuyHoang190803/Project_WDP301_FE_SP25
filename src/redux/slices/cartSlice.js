import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import CartApi from "../../api/CartApi";
import { toast } from "react-toastify";

const initialState = {
    cartItems: [],
    status: 'idle',
    error: null
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
    try {
        const response = await CartApi.getCart();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const addToCart = createAsyncThunk("cart/addToCart", async ({ item }, { rejectWithValue }) => {
    try {
        const response = await CartApi.addToCarts(item);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ item }, { rejectWithValue }) => {
    try {
        const response = await CartApi.updateCartItem(item);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const removeFromCart = createAsyncThunk("cart/removeFromCart", async ({ item }, { rejectWithValue }) => {
    try {
        await CartApi.deleteCartItem({ items: [item] });
        return item;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const cartSlice = createSlice({
    name: "cart",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cartItems = action.payload.items;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(addToCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                const { items } = action.payload;



                // Tìm sản phẩm mới hoặc sản phẩm đã thay đổi số lượng
                const updatedItem = items.find(item =>
                    !state.cartItems.some(cartItem =>
                        cartItem.productId === item.productId &&
                        (!cartItem.variantId || cartItem.variantId === item.variantId)
                    ) ||
                    state.cartItems.some(cartItem =>
                        cartItem.productId === item.productId &&
                        (!cartItem.variantId || cartItem.variantId === item.variantId) &&
                        cartItem.quantity !== item.quantity
                    )
                );

                if (updatedItem) {
                    const oldCartItem = state.cartItems.find(cartItem =>
                        cartItem.productId === updatedItem.productId &&
                        (!cartItem.variantId || cartItem.variantId === updatedItem.variantId)
                    );
                    toast.success("Cập nhập giỏ hàng thành công");

                }

                state.cartItems = items;
                state.status = 'succeeded';
            })
            .addCase(addToCart.rejected, (state, action) => {
                toast.error("Thêm vào giỏ hàng thất bại");
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateCartItem.pending, (state) => {
                state.status = 'loading';
            })

            .addCase(updateCartItem.fulfilled, (state, action) => {
                const { items } = action.payload;
                const currentCartItems = current(state.cartItems); // Sử dụng current để truy cập giá trị hiện tại

                // Tìm sản phẩm mới hoặc sản phẩm đã thay đổi số lượng
                const updatedItem = items.find(item =>
                    !currentCartItems.some(cartItem =>
                        cartItem.productId === item.productId &&
                        (!cartItem.variantId || cartItem.variantId === item.variantId)
                    ) ||
                    currentCartItems.some(cartItem =>
                        cartItem.productId === item.productId &&
                        (!cartItem.variantId || cartItem.variantId === item.variantId) &&
                        cartItem.quantity !== item.quantity
                    )
                );
                if (updatedItem) {
                    console.log(currentCartItems);

                    const oldCartItem = currentCartItems.find(cartItem =>
                        cartItem.productId === updatedItem.productId &&
                        (!cartItem.variantId || cartItem.variantId === updatedItem.variantId)
                    );
                    toast.success("Cập nhật giỏ hàng thành công");

                }

                state.cartItems = items;
                state.status = 'succeeded';
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                toast.error("Cập nhật giỏ hàng thất bại");
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(removeFromCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                const { productId, variantId } = action.payload;

                state.cartItems = state.cartItems.filter(item =>
                    !(item.productId === productId && (!variantId || item.variantId === variantId))
                );

                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                state.status = 'succeeded';
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                toast.error("Xóa sản phẩm khỏi giỏ hàng thất bại");
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;