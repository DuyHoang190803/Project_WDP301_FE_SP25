import { USER_ACTIONS } from "../constants/userConstants";
import * as constants from "../../constants/index.js";
import AuthApi from "../../api/AuthApi.js";
import storage from "../../utils/storage.js";
import { jwtDecode } from "jwt-decode";

// // Đăng nhập
// export const loginWithMail = (email, password) => async (dispatch) => {
//     dispatch({ type: USER_ACTIONS?.USER_LOGIN_REQUEST });

//     try {
//         const response = await AuthApi.login(email, password);

//         if (response.data.status === constants.httpStatusCodes.HTTP_OK &&
//             response.data.accessToken &&
//             response.data.refreshToken) {


//                 console.log(response.data);
                

//             const decodedToken = jwtDecode(response.data.accessToken);

//             storage.saveBothTokenInfo(
//                 response.data.accessToken,
//                 response.data.refreshToken
//             );

//             storage.setUserInfo(decodedToken);

//             console.log(decodedToken?.user);
            

//             dispatch({
//                 type: USER_ACTIONS?.USER_LOGIN_SUCCESS,
//                 payload: decodedToken?.user
//             });

//         }
//     } catch (error) {
//         console.log(error?.response?.data?.message);

//         if (error.response) {
//             // Kiểm tra lỗi Unauthorized (401)
//             if (error.response.status === constants.httpStatusCodes.HTTP_UNAUTHORIZED) {
//                 dispatch({
//                     type: USER_ACTIONS?.USER_LOGIN_FAIL,
//                     payload: constants.notificationMessages.ERROR_INVALID_CREDENTIALS
//                 });
//             }
//             // Kiểm tra lỗi Bad Request (400) cho mật khẩu quá ngắn
//             else if (error.response.status === constants.httpStatusCodes.HTTP_BAD_REQUEST) {
//                 dispatch({
//                     type: USER_ACTIONS?.USER_LOGIN_FAIL,
//                     payload: error?.response?.data?.message
//                 });
//             } else {
//                 dispatch({
//                     type: USER_ACTIONS?.USER_LOGIN_FAIL,
//                     payload: 'Đã xảy ra lỗi, vui lòng thử lại sau.'
//                 });
//             }
//         }
//     }
// };


// // Đăng nhập với tài khoản Google
// export const loginWithGoogleAccount = (token) => async (dispatch) => {
//     dispatch({ type: USER_ACTIONS?.USER_LOGIN_REQUEST });

//     try {
//         // Gọi API để đăng nhập với token từ Google
//         const response = await AuthApi.loginWithGoogleAccount(token);

//         if (response.data.status === constants.httpStatusCodes.HTTP_OK &&
//             response.data.accessToken &&
//             response.data.refreshToken) {

//             const decodedToken = jwtDecode(response.data.accessToken);

//             // Lưu token vào localStorage
//             storage.saveBothTokenInfo(
//                 response.data.accessToken,
//                 response.data.refreshToken
//             );

//             // Lưu thông tin người dùng vào localStorage
//             storage.setUserInfo(decodedToken.user);
//             // Dispatch action login success
//             dispatch({
//                 type: USER_ACTIONS?.USER_LOGIN_SUCCESS,
//                 payload: decodedToken?.user
//             });

//         }
//     } catch (error) {
//         console.log(error.response);

//         // Xử lý lỗi khi không thành công
//         if (error.response && error.response.status === constants.httpStatusCodes.HTTP_UNAUTHORIZED) {
//             dispatch({
//                 type: USER_ACTIONS?.USER_LOGIN_FAIL,
//                 payload: error.response.data.message || 'Đăng nhập thất bại'
//             });
//         } else {
//             dispatch({
//                 type: USER_ACTIONS?.USER_LOGIN_FAIL,
//                 payload: 'Đã xảy ra lỗi, vui lòng thử lại sau.'
//             });
//         }
//     }
// };




// // Đăng xuất
// export const logout = () => (dispatch) => {
//     storage.clearToken();
//     storage.getUserInfo();
//     dispatch({ type: USER_ACTIONS?.USER_LOGOUT });
// };
