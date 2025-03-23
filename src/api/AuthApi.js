import UnauthorApi from "./baseAPI/UnauthorBaseApi"
import * as constants from '../constants/index.js';
import storage from "../utils/storage.js";
import axios from "axios";
import AuthorApi from "./baseAPI/AuthorBaseApi.js"

class AuthAPI {

    constructor() {
        this.url = "/api/v1/auth"
    }

    // Login method: sends email and password to the login endpoint
    login = (email, password) => {
        const body = {
            email: email,
            password: password
        }
        return UnauthorApi.post(`${this.url}/login`, body)
    }

    // Login with Google Account method
    loginWithGoogleAccount = (token) => {
        return UnauthorApi.post(`${this.url}/google`, { token });
    }


    // Sign Up method: registers a new user with the provided details
    signUp = (fullName, email, password) => {
        const body = {
            fullName: fullName,
            email: email,
            password: password
        }
        return UnauthorApi.post(`${this.url}/register`, body)
    }


    forgotPassword = (email) => {
        const body = {
            email: email
        }
        return UnauthorApi.put(`${this.url}/forgot-pw`, body)
    }

    resetPassword = (token, newPassword) => {
        const body = {
            token: token,
            newPassword: newPassword
        }
        return UnauthorApi.put(`${this.url}/reset-password`, body)
    }


    checkResetTokenExprided = (resetPWToken) => {
        const body = {
            resetPWToken: resetPWToken,
        }
        return UnauthorApi.post(`${this.url}/checkTokenExprided`, body)
    }


    logout = () => {
        return UnauthorApi.put(`${this.url}/logout`)
    }


    refreshToken = async () => {
        return AuthorApi.post(`${this.url}/refresh-token`)
    }


    changePassword = (password, newPassword) => {
        const body = {
            password: password,
            newPassword: newPassword
        }
        return UnauthorApi.put(`${this.url}/change-password`, body)
    }

    // checkAuth = async () => {

    //     return await axios.get(`${this.url}/check-auth`, {
    //         withCredentials: true,
    //     });
    // };



    // Logout method: sends refreshToken to logout endpoint
    // logout = (refreshToken) => {
    //     const body = {
    //         refreshToken: refreshToken
    //     }
    //     return UnauthorApi.post(`${this.url}/logout`, body)
    // }

    // // Forgot Password method: sends an email to reset the password
    // forgotPassword = (email) => {
    //     const body = {
    //         email: email
    //     }
    //     return UnauthorApi.post(`${this.url}/forgot`, body)
    // }

    // Verify Token method: verifies the reset password token
    // verifyToken = (token) => {
    //     return UnauthorApi.get(`${this.url}/reset/${token}`)
    // }

    // // Reset Password method: resets the password using the token
    // resetPassword = async (password, confirmPassword, token) => {
    //     const body = { password: password, confirmPassword: confirmPassword }
    //     return UnauthorApi.put(`${this.url}/reset/${token}`, body)
    // }





    // Resend Active Account Email method: sends a verification email to the username
    // resendActiveAccountEmail = (username) => {
    //     return UnauthorApi.get(`${this.url}/registration/active-mail?username=${username}`)
    // }


    updateUser = async (payload) => {
        return AuthorApi.put(`${this.url}`, payload);
    };
}

export default new AuthAPI()
