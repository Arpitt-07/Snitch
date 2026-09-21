// src/store/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
    try {
        const res = await api.get("/cart");
        return res.data.data;
    } catch (err) {
        throw err;
    }
});

export const addToCart = createAsyncThunk(
    "cart/add",
    async ({ productId, variantId, size, quantity = 1 }, { rejectWithValue }) => {
        try {
            // Comprehensive payload to cover all possible backend naming conventions
            await api.post("/cart", {
                productId,
                product: productId,
                product_id: productId,
                variantId,
                variant: variantId,
                variant_id: variantId,
                size,
                quantity
            });
            const res = await api.get("/cart");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to add item to cart");
        }
    }
);

export const updateCartItem = createAsyncThunk(
    "cart/update",
    async ({ itemId, quantity }) => {
        await api.patch(`/cart/${itemId}`, { quantity });
        const res = await api.get("/cart"); 
        return res.data.data;
    }
);

export const removeCartItem = createAsyncThunk(
    "cart/remove",
    async (itemId) => {
        await api.delete(`/cart/${itemId}`);
        const res = await api.get("/cart");
        return res.data.data;
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        total: 0,
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => { state.status = "loading"; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = "idle";
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            });
    },
});

export default cartSlice.reducer;