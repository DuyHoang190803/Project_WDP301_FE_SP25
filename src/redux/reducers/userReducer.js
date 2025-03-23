// import storage from "../../utils/storage";
// import { USER_ACTIONS } from "../constants/userConstants";

// // khởi tạo state
// const initialState = {
//     userInfo: storage.getUserInfo(),
//     loading: false,
//     error: null,
// };

// // User Reducer
// const userReducer = (state = initialState, action) => {
//     switch (action.type) {

//         // lây thống tin người dùng
//         case USER_ACTIONS?.USER_LOGIN_REQUEST:
//             return { ...state, loading: true };

//         // lây thống tin người dùng thành công
//         case USER_ACTIONS?.USER_LOGIN_SUCCESS:
//             return { ...state, loading: false, userInfo: action.payload };

//         // lây thống tin người dùng thất bại
//         case USER_ACTIONS?.USER_LOGIN_FAIL:
//             return { ...state, loading: false, error: action.payload };

//         // Đăng xuat
//         case USER_ACTIONS?.USER_LOGOUT:
//             return { ...state, userInfo: null };

//         default:
//             return state;
//     }
// };

// export default userReducer;
