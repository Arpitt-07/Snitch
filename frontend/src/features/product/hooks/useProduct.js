import { createProduct, getAllProducts } from "../services/product.services.js";
import { useDispatch } from "react-redux";
import { setProducts } from "../state/product.slice.js";


export const useProduct = () => {
    const dispatch = useDispatch();

    const handleCreateProduct = async ({ name, description, price, image }) => {
        try {
            const res = await createProduct({ name, description, price, image });
            dispatch(setProducts(res.data));
            return res.data.success;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message || "An error occurred"));
        }
    }

    const handleGetAllProducts = async () => {
        try {
            const res = await getAllProducts();
            dispatch(setProducts(res.data));
            return res.data.success;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message || "An error occurred"));
        }
    }

}