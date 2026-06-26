import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true
})

export async function register({
    username, email, password, phone, isSeller = false
}) {
    return api.post("/register", {
        username,
        email,
        password,
        phone, 
        isSeller
    })
}
export async function login({
    email,
    password,
}) {
    return api.post("/login", {
        email,
        password,
    })
}
export async function logout() {
    return api.post("/logout")
}