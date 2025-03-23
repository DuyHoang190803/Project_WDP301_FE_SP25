import { ADDRESS_ACTIONS } from "../constants/addressConstants";    // Import các hằng số action


// Khởi tạo state
const initialState = {
    addresses: [],
    loading: false,
    error: null,
};


// Address Reducer
const addressReducer = (state = initialState, action) => {  // Reducer nhận vào state hiện tại và action
    switch (action.type) {  // Xử lý action

        // Lấy danh sách địa chỉ
        case ADDRESS_ACTIONS.ADDRESS_LIST_REQUEST:  // Nếu action là lấy danh sách địa chỉ
            return { ...state, loading: true };
        case ADDRESS_ACTIONS.ADDRESS_LIST_SUCCESS:      // Nếu action là lấy danh sách địa chỉ thành công
            return { ...state, loading: false, addresses: action.payload };
        case ADDRESS_ACTIONS.ADDRESS_LIST_FAIL:     // Nếu action là lấy danh sách địa chỉ thất bại
            return { ...state, loading: false, error: action.payload };


        // Tạo địa chỉ
        case ADDRESS_ACTIONS.ADDRESS_CREATE_REQUEST:    // Nếu action là tạo địa chỉ
            return { ...state, loading: true };
        case ADDRESS_ACTIONS.ADDRESS_CREATE_SUCCESS:    // Nếu action là tạo địa chỉ thành công
            return { ...state, loading: false, addresses: action.payload };
        case ADDRESS_ACTIONS.ADDRESS_CREATE_FAIL:   // Nếu action là tạo địa chỉ thất bại
            return { ...state, loading: false, error: action.payload };


        // Chỉnh sửa địa chỉ
        case ADDRESS_ACTIONS.ADDRESS_EDIT_REQUEST:  // Nếu action là chỉnh sửa địa chỉ
            return { ...state, loading: true };
        case ADDRESS_ACTIONS.ADDRESS_EDIT_SUCCESS:  // Nếu action là chỉnh sửa địa chỉ thành công
            return { ...state, loading: false, addresses: action.payload };
        case ADDRESS_ACTIONS.ADDRESS_EDIT_FAIL:    // Nếu action là chỉnh sửa địa chỉ thất bại
            return { ...state, loading: false, error: action.payload };


        // Xóa địa chỉ
        case ADDRESS_ACTIONS.ADDRESS_DELETE_REQUEST:    // Nếu action là xóa địa chỉ
            return { ...state, loading: true };
        case ADDRESS_ACTIONS.ADDRESS_DELETE_SUCCESS:    // Nếu action là xóa địa chỉ thành công
            return { ...state, loading: false, addresses: action.payload };
        case ADDRESS_ACTIONS.ADDRESS_DELETE_FAIL:   // Nếu action là xóa địa chỉ thất bại
            return { ...state, loading: false, error: action.payload };


        // Đặt địa chỉ mặc định
        case ADDRESS_ACTIONS.ADDRESS_SET_DEFAULT_REQUEST:  // Nếu action là đặt địa chỉ mặc định
            return { ...state, loading: true };
        case ADDRESS_ACTIONS.ADDRESS_SET_DEFAULT_SUCCESS:  // Nếu action là đặt địa chỉ mặc định thành công
            return { ...state, loading: false, addresses: action.payload };
        case ADDRESS_ACTIONS.ADDRESS_SET_DEFAULT_FAIL:     // Nếu action là đặt địa chỉ mặc định thất bại
            return { ...state, loading: false, error: action.payload };


        // Trả về state hiện tại
        default:
            return state;


    }
};

export default addressReducer;