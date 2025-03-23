import AuthorApi from "./baseAPI/AuthorBaseApi";
import * as constants from "../constants/index.js";

class OrderApi {
    constructor() {
        this.url = "/api/v1/order";
    }

    createOrder = async (body) => {
        return AuthorApi.post(`${this.url}/create-order`, body);
    };

    createPaymentUrl = async (amount, bankCode, language) => {
        const body = {
            amount: amount,
            bankCode: bankCode,
            language: language,
        };
        return AuthorApi.post(`${this.url}/create_payment_url`, body);
    };

    getOrderList = async (status, query = "", page = 1, pageSize = 10) => {
        const queryParam = query ? `&query=${encodeURIComponent(query)}` : "";
        return AuthorApi.get(
            `${this.url}/list?status=${status}${queryParam}&page=${page}&pageSize=${pageSize}`
        );
    };

    getOrderDetail = async (orderId) => {
        return AuthorApi.get(`${this.url}/${orderId}`);
    };

    getAllOrder = async () => {
        return AuthorApi.get(`${this.url}/list?status=ALL`);
    };


    cancelOrder = async (orderId, status, canceledReason) => {
        const body = {
            status: status,
        };

        // Chỉ thêm canceledReason vào body nếu status là "CANCELED" và canceledReason được cung cấp
        if (status === "CANCELED" && canceledReason) {
            body.canceledReason = canceledReason;
        }

        return AuthorApi.patch(`${this.url}/${orderId}/update-status`, body);
    };


}

export default new OrderApi();