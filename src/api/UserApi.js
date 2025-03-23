// import storage from "../utils/storage"
import AuthorApi from "./baseAPI/AuthorBaseApi"
import UnauthorApi from "./baseAPI/UnauthorBaseApi"
import * as constants from '../constants/index.js';



class UserApi {

    constructor() {
        this.url = "/api/v1"
    }

    getAllUsers = async (apiParams = {}) => {
        const queryString = new URLSearchParams(apiParams).toString();
        return AuthorApi.get(`${this.url}/users?${queryString}`);
    };

    
    getUserById = async (accountId) => {
        return AuthorApi.get(`${this.url}/users/${accountId}`);
    };

}

export default new UserApi()
