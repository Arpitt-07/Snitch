"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import Button from "./Button";

export default function GoogleSignInButton() {
    const router = useRouter();
    const { setUser } = useAuth();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https:
        script.async = true;
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    try {
                        const res = await api.post("/auth/google", { credential: response.credential });
                        setUser(res.data.data);
                        router.push("/");
                    } catch (err) {
                        console.error("Google sign-in failed", err);
                    }
                },
            });
        };
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [setUser, router]);

    const handleGoogleLogin = () => {
        if (window.google) {
            window.google.accounts.id.prompt();
        } else {
            console.error("Google SDK not loaded yet");
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 group"
        >
            <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.41 8.19 1 9.62 1 11.1v1.8c0 .54.22 1.04.62 1.44l3.62-1.44z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.9 la 1 la 1 l 4.26 4.26c1.24 1.24 3.1 2.14 5.26 2.14z" fill="#EA4335"/>
            </svg>
            <span className="font-mono text-[11px] uppercase tracking-widest">Continue with Google</span>
        </Button>
    );
}