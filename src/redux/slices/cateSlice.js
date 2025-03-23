import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CategoryApi from '../../api/CategoryApi';



export const searchCategories = createAsyncThunk(
    'category/searchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await CategoryApi.searchCategoriesForCustomer();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const searchCategoriesChildren = createAsyncThunk(
    'category/searchCategoriesChildren',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await CategoryApi.searchCategoriesChildrensForCustomer(slug);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async () => {
        try {
            const response = await CategoryApi.deleteCategories(id);
            return response.data; // Assuming the API returns data in a `data` field
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async ({ id, body }, { rejectWithValue }) => {
        try {
            const response = await CategoryApi.updateCategories(id, body);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (body, { rejectWithValue }) => {
        try {
            const response = await CategoryApi.createCategories(body);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const checkCategoryIsUsed = createAsyncThunk(
    'category/checkCategoryIsUsed',
    async (id, { rejectWithValue }) => {
        try {
            const response = await CategoryApi.categoriesIsUsed(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        cateChildren: [],
        loading: false,
        error: null,
        isUsed: false,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetIsUsed: (state) => {
            state.isUsed = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(searchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(searchCategoriesChildren.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchCategoriesChildren.fulfilled, (state, action) => {
                state.loading = false;
                state.cateChildren = action.payload;
            })
            .addCase(searchCategoriesChildren.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;

                state.categories = state.categories.filter(category => category.id !== action.payload.id);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCategory = action.payload;
                state.categories = state.categories.map(category =>
                    category.id === updatedCategory.id ? updatedCategory : category
                );
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(checkCategoryIsUsed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkCategoryIsUsed.fulfilled, (state, action) => {
                state.loading = false;
                state.isUsed = action.payload.isUsed;
            })
            .addCase(checkCategoryIsUsed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, resetIsUsed } = categorySlice.actions;
export default categorySlice.reducer;
