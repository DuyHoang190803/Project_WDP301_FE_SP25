import axios from "axios"
import { apiBaseConfig } from "../../config/apiBaseConfig.js"
import storage from "../../utils/storage"
import * as constants from '../../constants/index.js';


const axiosClient = axios.create({
  baseURL: apiBaseConfig.baseURL,
  headers: apiBaseConfig.headers,
  withCredentials: true
})

axiosClient.interceptors.response.use(
  (response) => {
    if (response !== undefined && response.data !== undefined) {
      // get all response
      return response
    }
    return response
  },
  (error) => {
    // Internal Server
    // if (error.response && error.response.status === constants.httpStatusCodes.HTTP_INTERNAL_SERVER_ERROR) {
    //   window.location.href = "/auth/500";
    // }

    // Refresh token is expired
    // if (error.response && error.response.status === 404) {
    //   storage.clearToken();
    //   storage.clearUserInfo();
    //   storage.getRefreshToken();
    //   window.location.href = "/home";
    // }

    // // Unauthorized
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized error:", error)
      throw new Error(error?.response?.data?.message)
    }

    // // Bad request
    // if (error.response && error.response.status === 400) {
    //   console.error("Bad request:", error);
    //   throw new Error(error);
    // }
    // console.error("Bad request:", error);
    // handle error
    throw error
  }
)

export default axiosClient
