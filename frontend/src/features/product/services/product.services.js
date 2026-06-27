import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000/api/products",
    withCredentials: true
})

export const createProduct = async (formData) => {
    try{
        const response = await api.post("/create-product", formData)
        return response.data;
    }
    catch(error){
        console.log(error)
        throw error
    }
}

export const getAllProducts = async()=>{
    try{
        const response = await api.get("/get-products")
        return response.data;
    }
    catch(error){
        console.log(error)
        throw error
    }
}