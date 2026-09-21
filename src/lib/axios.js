// src/lib/axios.js
"use client";

const BASE_URL = "/api";

let isRefreshing = false;
let queue = [];

const processQueue = (error) => {
    queue.forEach((p) => (error ? p.reject(error) : p.resolve()));
    queue = [];
};

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    };

    let response = await fetch(url, {
        ...config,
        headers: options.body instanceof FormData
            ? {}
            : config.headers
    });

    if (response.status === 401 && !options._retry && !url.includes("/auth/refresh")) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push({ resolve, reject });
            })
                .then(() => request(endpoint, { ...options, _retry: true }));
        }

        options._retry = true;
        isRefreshing = true;

        try {
            const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!refreshResponse.ok) throw new Error("Refresh failed");

            processQueue(null);
            return request(endpoint, { ...options, _retry: true });
        } catch (refreshError) {
            processQueue(refreshError);
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }

    if (!response.ok) {
        const error = new Error(response.statusText || "Request failed");
        error.response = { status: response.status, data: await response.json().catch(() => ({})) };
        throw error;
    }

    const data = await response.json().catch(() => ({}));
    return { data };
}

const api = {
    get: (url, config) => request(url, { ...config, method: "GET" }),
    post: (url, data, config) => request(url, {
        ...config,
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    put: (url, data, config) => request(url, {
        ...config,
        method: "PUT",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (url, config) => request(url, { ...config, method: "DELETE" }),
    patch: (url, data, config) => request(url, {
        ...config,
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
};

export default api;
