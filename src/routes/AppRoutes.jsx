import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserList from "../pages/Auth/UserList";
import Register from "../pages/auth/Register";
import MyAddress from "../pages/Account/Address";
import MyProfile from "../pages/Account/Profile";
import ActiveUsers from "../pages/auth/ActiveUsers";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLayout from "../pages/Admin/AdminLayout";
import Home from "../pages/Home";
import MyAccountLayout from "../layouts/MyAccountLayout";
import DashboardAdmin from "../pages/Admin/DashboardAdmin/DashboardAdmin";
import ManageUsers from "../pages/Admin/ManageUsers/ManageUsers";
import ManageProducts from "../pages/Admin/ManageProducts/ManageProducts";
import ManageCategories from "../pages/Admin/ManageCategories/ManageCategories";
import ManageOrders from "../pages/Admin/ManageOrder/ManageOrder";
import MainLayout from "../layouts/MainLayout/MainLayout";
// import ProductForm from "../pages/Admin/CreateProductPage/CreateProductPage";
import CartPage from "../pages/Cart";
import ChangePassword from "../pages/Account/ChangePassword";
import Order from "../pages/Account/Order";
import OrderDetail from "../pages/Account/Order/OrderDetail";
import ProductDetail from "../pages/Products/ProductDetail";
import DetailOrder from "../pages/Admin/DetailOrder/DetailOrder";

import withAuthentication from "../hoc/withAuthentication";
import withAuthorization from "../hoc/withAuthorization";
import * as constants from '../constants/index.js';
import Checkout from "../pages/Account/Checkout/index.jsx";
import Login from "../pages/Auth/Login";
import ForbiddenPage from "../pages/Error/403/index.jsx";
import NotFoundPage from "../pages/Error/404/index.jsx";
// import UpdateProduct from "../pages/Admin/UpdateProduct/UpdateProduct.jsx";
import VNPayReturn from "../pages/Account/Order/VNPayReturn/index.jsx";
import ListProductFilter from "../pages/Products/ListProductFilter/index.jsx";
import ListProductSearch from "../pages/Products/ListProductSearch/index.jsx";
import ProductForm from "../pages/Admin/CreateProductPage/CreateProductTest.jsx";
import UpdateProduct from "../pages/Admin/UpdateProduct/UpdateProductTest.jsx";


const AppRouter = ({ isAuthenticated, userInfo }) => {
    return (
        <Router>
            <Routes>
                <Route path="userlist" element={<UserList />} />

                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />


                <Route path="checkout" element={<Checkout />} />

                <Route path="order/vnpay_return" element={<VNPayReturn />} />


                <Route
                    path="/account/*"
                    element={React.createElement(withAuthentication(withAuthorization([constants.userRoles.ROLE_USER])(MyAccountLayout)))} >
                    <Route path="address" element={<MyAddress />} />
                    <Route path="profile" element={<MyProfile />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="order" element={<Order />} />
                    <Route path="order/:orderId" element={<OrderDetail />} />
                </Route>


                <Route path="active-user" element={<ActiveUsers />} />
                <Route path="reset/confirm/:token" element={<ResetPassword />} />

                <Route path="/admin" element={React.createElement(withAuthentication(withAuthorization([constants.userRoles.ROLE_ADMIN, constants.userRoles.ROLE_EMPLOYEE])(AdminLayout)))} >
                    <Route path="dashboard" element={<DashboardAdmin />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="products" element={<ManageProducts />} />
                    <Route path="categories" element={<ManageCategories />} />
                    <Route path="orders" element={<ManageOrders />} />
                    <Route path="orders/:orderId" element={<DetailOrder />} />
                    <Route path="add-product" element={<ProductForm />} />

                    <Route path="update-product/:id" element={<UpdateProduct />} />
                </Route>

                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path='products/:id' element={<ProductDetail />} />
                    <Route path="collections/:slug" element={<ListProductFilter />}></Route>
                    <Route path="search" element={<ListProductSearch />}></Route>


                    {/* <Route path="about" element={<About />} /> */}
                    {/* <Route path="contact" element={<Contact />} /> */}
                </Route>


                <Route path="/">
                    <Route path="403" element={<ForbiddenPage />} />
                    <Route path='404' element={<NotFoundPage />} />

                    {/* <Route path="about" element={<About />} /> */}
                    {/* <Route path="contact" element={<Contact />} /> */}
                </Route>
            </Routes>
        </Router >
    );
};

export default AppRouter;