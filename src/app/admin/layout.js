// src/app/admin/layout.js
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login"); // not authenticated at all — login makes sense here
        } else if (user.role !== "admin") {
            router.push("/"); // authenticated, just not authorized — send them home, not to login
        }
    }, [user, loading, router]);

    if (loading) return <p>Loading...</p>;
    if (!user || user.role !== "admin") return null;

    return <div className="pt-20">{children}</div>;
}