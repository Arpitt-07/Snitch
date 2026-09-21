// src/app/login/page.js
"use client";
import { useState, useRef,useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TransitionLink from "@/components/TransitionLink";
import Button from "@/components/ui/Button";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login,user,loading } = useAuth();
    const router = useRouter();
    const errorRef = useRef(null);
    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            router.push("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed";
            setError(msg);
            if (errorRef.current) {
                gsap.fromTo(errorRef.current,
                    { x: -5 },
                    { x: 5, duration: 0.1, repeat: 3, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.to(errorRef.current, { x: 0 }) }
                );
            }
        }
    };

    const inputClass =
        "w-full bg-transparent border-b border-ink/20 py-3 outline-none focus:border-ink transition-colors text-sm text-ink placeholder:text-ink/30";
    const labelClass =
        "font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40";

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-md">
                <div className="mb-16">
                    <p className={labelClass}>The Collection</p>
                    <h1 className="mt-3 text-6xl md:text-7xl font-black uppercase tracking-tighter text-ink mb-4">
                        Return
                    </h1>
                    <p className="text-sm text-ink/50 uppercase tracking-[0.2em]">
                        Welcome back to the house
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    {error && (
                        <div ref={errorRef} className="p-4 border border-thread/30 bg-thread/10 text-ink text-xs">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Email Address</label>
                        <input
                            type="email"
                            required
                            className={inputClass}
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Password</label>
                        <input
                            type="password"
                            required
                            className={inputClass}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-4">
                        Sign In
                    </Button>

                    <div className="text-center mt-8">
                        <p className="text-xs text-ink/50">
                            New to the house?{" "}
                            <TransitionLink href="/register" className="text-ink underline underline-offset-4 hover:text-thread transition-colors">
                                Create an account
                            </TransitionLink>
                        </p>
                    </div>
                </form>

                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-bg-main px-4 text-xs uppercase tracking-[0.2em] text-ink/40 font-mono">or</span>
                    </div>
                </div>

                <GoogleSignInButton />
            </div>
        </div>
    );
}