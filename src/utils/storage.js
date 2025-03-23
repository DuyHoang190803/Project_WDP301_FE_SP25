let accessToken = ""
let refreshToken = ""

const storage = {
    // Lấy Access Token
    getToken: () => accessToken,

    // Lấy Refresh Token
    getRefreshToken: () => refreshToken,

    // Lưu cả Access Token và Refresh Token
    saveBothTokenInfo: (token, newRefreshToken) => {
        accessToken = token
        refreshToken = newRefreshToken
        // Lưu token và refreshToken vào localStorage
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
    },

    // Lưu Access Token
    saveAccessTokenInfo: (token) => {
        accessToken = token
        localStorage.setItem("accessToken", accessToken)
    },

    // Lấy token và refreshToken từ localStorage khi load trang
    loadTokenFromStorage: () => {
        accessToken = localStorage.getItem("accessToken") || ""
        refreshToken = localStorage.getItem("refreshToken") || ""
    },

    // Xóa cả Access Token và Refresh Token
    clearToken: () => {
        accessToken = ""
        refreshToken = ""
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
    },

    // Xóa chỉ Access Token
    clearAccessToken: () => {
        accessToken = ""
        localStorage.removeItem("accessToken")
    },

    // Lấy thông tin người dùng từ localStorage
    getUserInfo: () => {
        const userInfo = localStorage.getItem("userInfo") || {}
        return userInfo ? JSON.parse(userInfo) : {}
    },

    // Lưu thông tin người dùng vào localStorage
    setUserInfo: (userInfo) => {
        localStorage.setItem("userInfo", JSON.stringify(userInfo))
    },

    // Xóa thông tin người dùng khỏi localStorage
    clearUserInfo: () => {
        localStorage.removeItem("userInfo")
    }
}

// Load token khi refresh trang
storage.loadTokenFromStorage()

export default storage
