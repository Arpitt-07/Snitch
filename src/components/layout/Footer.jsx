"use client";
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import TransitionLink from "@/components/TransitionLink";
import api from "@/lib/axios";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FOOTER_LINKS = {
    Shop: [
        { label: "Menswear", href: "/products?department=Menswear" },
        { label: "Womenswear", href: "/products?department=Womenswear" },
        { label: "Accessories", href: "/products?department=Accessories" },
    ],
    Explore: [
        { label: "Journal", href: "/journal" },
        { label: "About", href: "/about" },
    ],
    Support: [
        { label: "Contact", href: "/contact" },
        { label: "Shipping & Returns", href: "/shipping" },
    ],
};

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const reduce = useReducedMotion();
    const footerRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setStatus("submitting");
        try {
            await api.post("/newsletter", { email });
            setStatus("done");
            setEmail("");
        } catch {
            setStatus("error");
        }
    };

    useGSAP(() => {
        if (reduce) {
            gsap.set(".footer-block", { clipPath: "inset(0% 0% 0% 0%)", y: 0 });
            return;
        }

        // Set initial state: fully masked/clipped from the bottom up, pushed down slightly
        gsap.set(".footer-block", { 
            clipPath: "inset(0% 0% 100% 0%)", 
            y: 60 
        });

        gsap.to(".footer-block", {
            clipPath: "inset(0% 0% 0% 0%)", 
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out", 
            scrollTrigger: {
                trigger: footerRef.current,
                start: "top 85%", 
                toggleActions: "play none none none",
                invalidateOnRefresh: true,
            },
        });
    }, { scope: footerRef, dependencies: [reduce] });

    useEffect(() => {
        if (reduce) return;

        const refresh = () => ScrollTrigger.refresh();

        if (document.readyState === "complete") {
            refresh();
        } else {
            window.addEventListener("load", refresh);
        }

        const timeout = setTimeout(refresh, 500);

        return () => {
            window.removeEventListener("load", refresh);
            clearTimeout(timeout);
        };
    }, [reduce]);

    return (
        <footer
            ref={footerRef}
            className="bg-bg-main border-t border-ink/5 px-6 md:px-16 pt-24 pb-12 text-ink"
        >
            <div className="max-w-[1400px] mx-auto">

                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-32">
                    <div className="footer-block max-w-2xl">
                        <h2 className="text-4xl md:text-6xl font-sans font-medium uppercase tracking-tighter leading-[0.9] mb-8">
                            Defined by <br />
                            <span className="text-ink/40">Street Instinct.</span>
                        </h2>
                        <p className="text-ink/60 text-base md:text-lg leading-relaxed max-w-[50ch]">
                            Snitch crafts pieces for those who dress with intent.
                            Our collections balance raw urban energy with
                            precision tailoring.
                        </p>
                    </div>

                    <div className="footer-block w-full max-w-md">
                        <form onSubmit={handleSubmit} className="relative group">
                            <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-4">
                                Newsletter
                            </label>
                            <div className="flex items-center border-b border-ink/20 focus-within:border-ink transition-colors duration-500">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-ink/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="py-4 text-[11px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink transition-colors duration-300"
                                >
                                    {status === "submitting" ? "..." : "Join"}
                                </button>
                            </div>
                            {status === "done" && (
                                <p className="text-xs text-ink/50 mt-3 animate-in fade-in slide-in-from-top-1">You're on the list.</p>
                            )}
                            {status === "error" && (
                                <p className="text-xs text-ink mt-3 animate-in fade-in slide-in-from-top-1">Something went wrong.</p>
                            )}
                        </form>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
                    {Object.entries(FOOTER_LINKS).map(([heading, links], idx) => (
                        <div key={heading} className="footer-block">
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">
                                {heading}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href} className="group overflow-hidden">
                                        <TransitionLink
                                            href={link.href}
                                            className="text-sm text-ink/60 hover:text-ink transition-colors duration-300 inline-block relative"
                                        >
                                            {link.label}
                                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-ink scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        </TransitionLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className="footer-block hidden md:block">
                        <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">
                            Brand
                        </h4>
                        <p className="text-sm text-ink/60 leading-relaxed">
                            Precision in every stitch. <br />
                            Designed for the city.
                        </p>
                    </div>
                </div>
                <div className="footer-block flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-ink/5 text-[11px] font-mono uppercase tracking-widest text-ink/40">
                    <span>© {new Date().getFullYear()} SNITCH. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-8">
                        <TransitionLink href="/privacy" className="hover:text-ink transition-colors">Privacy</TransitionLink>
                        <TransitionLink href="/terms" className="hover:text-ink transition-colors">Terms</TransitionLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}