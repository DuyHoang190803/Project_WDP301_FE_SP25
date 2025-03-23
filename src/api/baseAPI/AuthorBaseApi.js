import axios from "axios"
import { apiBaseConfig } from "../../config/apiBaseConfig.js"
import AuthApi from "../AuthApi"
import * as constants from '../../constants/index.js';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: apiBaseConfig.baseURL,
    headers: apiBaseConfig.headers,
    withCredentials: true
})

axiosClient.interceptors.request.use((config) => {
    // Chỉ thêm token vào header, không gọi checkAuth
    const token = Cookies.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response !== undefined && response.data !== undefined) {
            // get all response
            return response;
        }
        return response
    },
    async (error) => {

        // Not Found
        if (error.response && error.response.status === constants.httpStatusCodes.HTTP_NOT_FOUND) {
            // window.location.href = "/auth/404"
            console.log("404");
            
        }

        // Token is expired
        if (error.response?.status === constants.httpStatusCodes.HTTP_UNAUTHORIZED) {
            const originalRequest = error.config;
            try {
                // Gọi API refresh token
                const response = await AuthApi.refreshToken();
                if (response?.data?.accessToken) {
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                window.location.href = "/login";
                // return Promise.reject(refreshError);
            }
        }

        // No Authorization
        // if (error.response && error.response.status === constants.httpStatusCodes.HTTP_FORBIDDEN) {
        //     window.location.href = "/403";
        // }

        // Internal Server
        if (error.response && error.response.status === constants.httpStatusCodes.HTTP_INTERNAL_SERVER_ERROR) {
            // window.location.href = "/500";
            console.log("500");
            
        }

        // handle error
        throw error
    }
)

export default axiosClient
