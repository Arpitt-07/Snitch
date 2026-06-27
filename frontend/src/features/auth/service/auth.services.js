import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true
})

export async function register({
    username, email, password, phone, isSeller = false
}) {
    const response = await api.post("/register", {
        username,
        email,
        password
    })
    return response;
}
export async function login({
    email,
    password,
}) {
    const response = await api.post("/login", {
        email,
        password,
    })
    return response;
}
export async function logout() {
    return await api.post("/logout")
}

export async function checkAuth() {
    return await api.get("/current-user")
}