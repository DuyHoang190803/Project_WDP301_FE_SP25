// import storage from "../utils/storage"
import AuthorApi from "./baseAPI/AuthorBaseApi"
import UnauthorApi from "./baseAPI/UnauthorBaseApi"
import * as constants from '../constants/index.js';
class CategoryApi {

    constructor() {
        this.url = "/api/v1/categories"
    }

    searchCategories = async (sKey) => {
        const res = await UnauthorApi.get(`${this.url}?query=${sKey}`)
        return res
    }
    searchCategoriesForCustomer = async () => {
        const res = await UnauthorApi.get(`${this.url}`)
        return res.data
    }
    searchCategoriesChildrensForCustomer = async (slug) => {
        const res = await UnauthorApi.get(`${this.url}?query=${slug}`)
        return res.data
    }
    deleteCategories = async (_id) => {
        return AuthorApi.delete(`${this.url}/${_id}`)
    }
    updateCategories = async (_id, body) => {
        return AuthorApi.patch(`${this.url}/${_id}`, body);
    }
    createCategories = async (body) => {
        return AuthorApi.post(`${this.url}`, body);
    }
    categoriesIsUsed = async (id) => {
        return AuthorApi.get(`${this.url}/has-product-in-category-tree/${id}`);
    }
}

export default new CategoryApi()
