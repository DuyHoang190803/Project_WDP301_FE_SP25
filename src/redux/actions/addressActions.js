import AddressApi from "../../api/AddressApi";  // Import API
import { ADDRESS_ACTIONS } from "../constants/addressConstants";    // Import các hằng số action
import storage from "../../utils/storage";  // Import storage để lưu thông tin user
import * as constants from "../../constants/index.js";



// Lấy danh sách địa chỉ// Lấy danh sách địa chỉ
export const listAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_LIST_REQUEST });

        // console.log("listAddresses");
        const { userInfo } = getState().user;  // Accessing the state properly

        // console.log(userInfo);


        // Lấy thông tin user từ storage
        const userId = userInfo?.user?.userId || userInfo?.userId;


        // Gọi API để lấy danh sách địa chỉ theo userId
        const { data } = await AddressApi.getAllAddressByUserId(userId);

        if (data?.data) {
            // Sắp xếp địa chỉ sao cho địa chỉ mặc định luôn ở đầu tiên
            const sortedAddresses = data.data.sort((a, b) => {
                if (a.isDefault === b.isDefault) {
                    return 0; // Nếu cả hai có cùng trạng thái isDefault thì không thay đổi thứ tự
                }
                return a.isDefault ? -1 : 1; // Địa chỉ có isDefault = true sẽ được xếp lên đầu
            });

            // console.log("sortedAddresses", sortedAddresses);

            dispatch({ type: ADDRESS_ACTIONS.ADDRESS_LIST_SUCCESS, payload: sortedAddresses });
        }

    } catch (error) {
        console.log("error", error);

        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_LIST_FAIL, payload: error.message });
    }
};



// Đặt địa chỉ làm mặc định
export const setDefaultAddress = (addressId) => async (dispatch, getState) => {
    try {
        dispatch({ type: ADDRESS_ACTIONS?.ADDRESS_SET_DEFAULT_REQUEST });

        // Gọi API để cập nhật địa chỉ mặc định
        const response = await AddressApi?.setDefaultAddress(addressId);

        if (response?.data?.status === constants?.httpStatusCodes?.HTTP_OK) {

            // Cập nhật lại danh sách địa chỉ trong Redux
            const { addresses } = getState()?.addresses;  // Lấy danh sách địa chỉ từ Redux

            const updatedAddresses = addresses.map((address) =>

                address?._id === addressId ? { ...address, isDefault: true } : { ...address, isDefault: false }
            );
            const sortedAddresses = updatedAddresses.sort((a, b) => b.isDefault - a.isDefault);

            // Dispatch lại action để cập nhật state
            dispatch({
                type: ADDRESS_ACTIONS.ADDRESS_SET_DEFAULT_SUCCESS,
                payload: sortedAddresses,
            });
        }
    } catch (error) {
        dispatch({
            type: ADDRESS_ACTIONS.ADDRESS_SET_DEFAULT_FAIL,
            payload: error.message,
        });
    }
};



// Xóa địa chỉ
export const deleteAddress = (addressId) => async (dispatch, getState) => {
    try {
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_DELETE_REQUEST });

        // Gọi API để xóa địa chỉ
        const response = await AddressApi.deleteAddress(addressId);

        if (response?.data?.status === constants?.httpStatusCodes?.HTTP_OK) {

            const { addresses } = getState()?.addresses;  // Lấy danh sách địa chỉ từ Redux

            // Cập nhật lại danh sách địa chỉ sau khi xóa
            const updatedAddresses = addresses.filter((address) => {

                // Thêm return để đảm bảo phần tử được giữ lại nếu _id không khớp
                return address._id !== addressId;
            });

            // Dispatch thành công và gửi danh sách địa chỉ đã cập nhật
            dispatch({
                type: ADDRESS_ACTIONS.ADDRESS_DELETE_SUCCESS,
                payload: updatedAddresses,
            });
        }

    } catch (error) {
        dispatch({
            type: ADDRESS_ACTIONS.ADDRESS_DELETE_FAIL,
            payload: error.message,
        });
    }
};




// Tạo địa chỉ mới
export const createAddress = (addressData) => async (dispatch, getState) => {
    try {
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_CREATE_REQUEST });
        console.log(addressData);

        const { userInfo } = getState().user;  // Accessing the state properly

        // Lấy thông tin user từ storage
        const userId = userInfo?.userId;

        const response = await AddressApi.createAddress(
            userId,
            addressData.fullName,
            addressData.phone,
            addressData.address,
            addressData.city,
            addressData.district,
            addressData.ward
        );

        // console.log("response", response);
        

        if (response?.data?.status === constants?.httpStatusCodes?.HTTP_CREATED) {
            // Lấy danh sách địa chỉ từ Redux store
            const { addresses } = getState()?.addresses || { addresses: [] }; // Đảm bảo addresses không undefined

            // Kiểm tra nếu chưa có địa chỉ nào thì đặt isDefault: true
            const isDefault = addresses.length === 0;

            // Tạo địa chỉ mới từ dữ liệu trả về
            const newAddress = {
                _id: response?.data?.res?._id, 
                isDefault: isDefault, // Đặt isDefault dựa trên điều kiện
                fullName: addressData.fullName,
                phone: addressData.phone,
                address: addressData.address,
                province: {
                    provinceId: addressData.city.cityId,  // Thay thế cityId thành provinceId
                    provinceName: addressData.city.name   // Thay thế name thành provinceName
                },
                district: {
                    districtId: addressData.district.districtId,  // Giữ lại districtId
                    districtName: addressData.district.name       // Thay thế name thành districtName
                },
                ward: {
                    wardId: addressData.ward.wardId,    // Giữ lại wardId
                    wardName: addressData.ward.name     // Thay thế name thành wardName
                }
            };

            // Thêm địa chỉ mới vào danh sách
            const updatedAddresses = [...addresses, newAddress];
            console.log("updatedAddresses", updatedAddresses);

            // Dispatch thành công và gửi danh sách địa chỉ đã cập nhật
            dispatch({
                type: ADDRESS_ACTIONS.ADDRESS_CREATE_SUCCESS,
                payload: updatedAddresses,
            });
        }
    } catch (error) {
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_CREATE_FAIL, payload: error.message });
    }
};





// Chỉnh sửa địa chỉ
export const editAddress = (addressId, addressData) => async (dispatch, getState) => {
    try {
        // Gửi yêu cầu chỉnh sửa địa chỉ
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_EDIT_REQUEST });

        // Gọi API để cập nhật địa chỉ
        const response = await AddressApi.updateAddress(addressId, addressData);

        // Kiểm tra nếu API trả về status là HTTP_CREATED
        if (response?.data?.status === constants?.httpStatusCodes?.HTTP_CREATED) {

            // Lấy danh sách địa chỉ hiện tại từ Redux store
            const { addresses } = getState()?.addresses;

            // Tìm và cập nhật địa chỉ trong danh sách
            const updatedAddresses = addresses.map(address =>
                address._id === addressId ? { ...address, ...response?.data?.data } : address
            );

            // Dispatch thành công với danh sách địa chỉ đã cập nhật
            dispatch({
                type: ADDRESS_ACTIONS.ADDRESS_EDIT_SUCCESS,
                payload: updatedAddresses,
            });
        }
    } catch (error) {
        // Xử lý lỗi khi gọi API
        dispatch({ type: ADDRESS_ACTIONS.ADDRESS_EDIT_FAIL, payload: error.message });
    }
};




