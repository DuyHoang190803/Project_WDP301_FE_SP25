import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ProductApi from "../../api/ProductApi";
import { removeUndefinedFields } from "../../utils/removeUndefinedFields";

const initialState = {
    productTableData: {
        items: [],
        page: 1,
        pageSize: 20,
        totalPages: 0,
        totalItems: 0,
    },
    productDetailData: {
        product: {},
        variants: [],
    },
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts(state, action) {
            state.productTableData.items = action.payload;
        },
        setProductDetail(state, action) {
            state.productDetailData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(viewData.fulfilled, (state, action) => {
                const { items, totalItems, page, pageSize, totalPages, loadMore } = action.payload;
                if (loadMore) {
                    state.productTableData.items = [...state.productTableData.items, ...items];
                } else {
                    state.productTableData.items = items;
                }
                state.productTableData.totalItems = totalItems;
                state.productTableData.page = page;
                state.productTableData.pageSize = pageSize;
                state.productTableData.totalPages = totalPages;
            })
            .addCase(viewDataDetail.fulfilled, (state, action) => {
                state.productDetailData.product = action.payload.product;
                state.productDetailData.variants = action.payload.variants;
            });
    },
});

export const viewData = createAsyncThunk(
    "product/viewData",
    async ({ query, sort, categoryIds, selectedPriceRanges, page, pageSize, loadMore = false }) => {
        const { label, gte, lte } = selectedPriceRanges || {};
        const filters = removeUndefinedFields({
            query,
            sort,
            categoryIds,
            "price[lte]": lte,
            "price[gte]": gte,
            page: page || 1,
            pageSize: pageSize || 20,
        });
        const response = await ProductApi.searchProducts(filters);
        return {
            items: response.rows,
            totalItems: response.count,
            page: page || 1,
            pageSize: pageSize || 20,
            totalPages: Math.ceil(response.count / (pageSize || 20)),
            loadMore,
        };
    }
);

export const viewDataDetail = createAsyncThunk("product/viewDataDetail", async (id) => {
    const response = await ProductApi.searchProductDetail(id);
    return {
        product: response.product,
        variants: response.variants,
    };
});

export const { setProducts, setProductDetail } = productSlice.actions;

export default productSlice.reducer;