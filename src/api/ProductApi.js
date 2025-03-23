// import storage from "../utils/storage"
import { objectToQueryString } from "../utils/queryString";
import UnauthorApi from "./baseAPI/UnauthorBaseApi"
import AuthorApi from "./baseAPI/AuthorBaseApi";
import { removeUndefinedFields } from "../utils/removeUndefinedFields";


class ProductApi {

    constructor() {
        this.url = "/api/v1/products"
    }

    searchProducts = async (filters = {}) => {
        if (!filters || typeof filters !== "object") {
            throw new Error("Invalid filters");
        }
        const queryString = objectToQueryString(filters);

        const response = await UnauthorApi.get(`${this.url}?${queryString}`);
        return response.data;
    }

    searchProductDetail = async (id) => {
        const response = await UnauthorApi.get(`${this.url}/${id}`);
        return response.data;
    }



    deleteProduct = async (_id) => {
        return AuthorApi.delete(`${this.url}/${_id}`)
    }
    updateProducts = async (_id, body) => {
        return AuthorApi.patch(`${this.url}/${_id}`, body);
    }
    createProducts = async (body) => {
        return AuthorApi.post(`${this.url}`, body);
    }
    getAllProducts = async (body) => {
        return AuthorApi.get(`${this.url}`);
    }

    getAllProductsAdmin = async (filters = {}) => {
        if (!filters || typeof filters !== "object") {
            throw new Error("Invalid filters");
        }
        const filterRs = removeUndefinedFields(filters)
        const queryString = objectToQueryString(filterRs);
        const response = await UnauthorApi.get(`${this.url}/admin?${queryString}`);
        return response.data;
    };

    searchProductsByKey = async (searchKey) => {
        return AuthorApi.get(`${this.url}?query=${searchKey}`);
    }

    ProductsIsUsed = async (id) => {
        return AuthorApi.get(`${this.url}/has-product-in-category-tree/${id}`);
    }
    getProductsById = async (id) => {
        return AuthorApi.get(`${this.url}/${id}`);
    }

}

export default new ProductApi()
