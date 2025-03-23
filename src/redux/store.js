import { configureStore } from "@reduxjs/toolkit";
import addressReducer from "./reducers/addressReducer";
import cartReDucer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import user from "./slices/authSlice";
import orderReDucer from "./slices/orderSlice"
import categoryReducer from "./slices/cateSlice"

const store = configureStore({
  reducer: {
    addresses: addressReducer,
    user: user,
    cart: cartReDucer,
    product: productReducer,
    order: orderReDucer,
    categoryReducer: categoryReducer
  },
});

export default store;
