import { createSlice } from "@reduxjs/toolkit"
import { createProduct, getAllProducts } from "../services/product.services";

const initialState = {
    products: [],
    loading: false,
    error: null,
    message: null
}

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: []

    },
    reducers: {
        setProducts: (state, action) => {
            state.products.push(action.payload)
        }
    }
})

export const { setProducts } = productSlice.actions
export default productSlice.reducer