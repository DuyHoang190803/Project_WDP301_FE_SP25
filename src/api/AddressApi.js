import AuthorApi from "./baseAPI/AuthorBaseApi"
import UnauthorApi from "./baseAPI/UnauthorBaseApi"
import * as constants from '../constants/index.js';
import locationApiEndpoints from "../config/locationApiEndpoints.js";


class AddressApi {

    constructor() {
        this.url = "/api/v1/deliveryAddress"
    }

    // Fetches the details of a specific request by ID
    getAllAddressByUserId = async (id) => {
        return AuthorApi.get(`${this.url}/user/${id}`)
    }
    //
    setDefaultAddress = async (id) => {
        return AuthorApi.put(`${this.url}/${id}/default`)
    }

    deleteAddress = async (id) => {
        return AuthorApi.delete(`${this.url}/${id}`)
    }


    createAddress = async (userId, fullName, phone, address, province, district, ward) => {
        const body = {
            fullName: fullName,
            phone: phone,
            address: address,
            province: {
                provinceId: province.cityId,  // Thay thế cityId thành provinceId
                provinceName: province.name   // Thay thế name thành provinceName
            },
            district: {
                districtId: district.districtId,  // Giữ lại districtId
                districtName: district.name       // Thay thế name thành districtName
            },
            ward: {
                wardId: ward.wardId,    // Giữ lại wardId
                wardName: ward.name     // Thay thế name thành wardName
            }
        }
        console.log(body);
        
        return AuthorApi.post(`${this.url}/user/${userId}`, body)
    }


    updateAddress = async (addressId, addressData) => {
        const body = {
            fullName: addressData.fullName,
            phone: addressData.phone,
            address: addressData.address,
            province: {
                provinceId: addressData.province.cityId,  // Lấy cityId từ province
                provinceName: addressData.province.name   // Lấy name từ province
            },
            district: {
                districtId: addressData.district.districtId,  // Giữ lại districtId
                districtName: addressData.district.name       // Giữ lại name của district
            },
            ward: {
                wardId: addressData.ward.wardId,    // Giữ lại wardId
                wardName: addressData.ward.name     // Giữ lại name của ward
            }
        };

        return AuthorApi.put(`${this.url}/${addressId}`, body);
    }



    getAllCity = async () => {
        return UnauthorApi.get(locationApiEndpoints.cityApi)
    }


    getAllDistrictByCityId = async (cityId) => {
        return UnauthorApi.get(`${locationApiEndpoints.districtsApi}?cityId=${cityId}`)
    }

    getAllWardByDistrictId = async (districtId) => {
        return UnauthorApi.get(`${locationApiEndpoints.wardsApi}?districtId=${districtId}`)
    }

}

export default new AddressApi()
