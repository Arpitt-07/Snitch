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
            router.push("/login");
        } else if (user.role !== "admin") {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) return <p>Loading...</p>;
    if (!user || user.role !== "admin") return null;

    return <div className="pt-20">{children}</div>;
}