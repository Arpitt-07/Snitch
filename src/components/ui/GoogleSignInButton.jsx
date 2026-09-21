// src/components/GoogleSignInButton.jsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleSignInButton() {
    const buttonRef = useRef(null);
    const router = useRouter();
    const { setUser } = useAuth();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
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
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: "outline",
                size: "large",
                width: 320,
            });
        };
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    return <div ref={buttonRef} />;
}