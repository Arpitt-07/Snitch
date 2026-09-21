// src/context/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children, initialUser = null }) {
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(!initialUser);

    useEffect(() => {
        if (initialUser) {
            setLoading(false);
            return;
        }
        api.post("/auth/refresh")
            .then(() => api.get("/auth/me"))
            .then((res) => setUser(res.data.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []); 

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        setUser(res.data.data);
        return res.data;
    };

    const register = async (username, email, password) => {
        const res = await api.post("/auth/register", { username, email, password });
        return res.data;
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);