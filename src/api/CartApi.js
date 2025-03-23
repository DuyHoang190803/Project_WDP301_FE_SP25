// import storage from "../utils/storage"
import AuthorApi from "./baseAPI/AuthorBaseApi"
class CartApi {

    constructor() {
        this.url = "/api/v1/carts"
    }

    addToCarts = async (body) => {
        return AuthorApi.post(`${this.url}`, body)
    }
    getCart = async () => {
        return AuthorApi.get(`${this.url}`)
    }
    updateCartItem = async (body) => {
        return AuthorApi.patch(`${this.url}`, body)
    }
    updateCartItemVariant = async (body) => {
        return AuthorApi.patch(`${this.url}/update-item-variant`, body)
    }
    deleteCartItem = async (body) => {
        return AuthorApi.delete(`${this.url}`, { data: body })
    }
}

export default new CartApi()
