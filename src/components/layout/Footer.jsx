// src/components/layout/Footer.jsx
"use client";
import { useState, useRef } from "react";
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
    const [status, setStatus] = useState("idle"); // idle | submitting | done | error
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
            gsap.set(".footer-block", { opacity: 1, y: 0 });
            return;
        }

        // Reveal content blocks as they enter view
        gsap.set(".footer-block", { opacity: 0, y: 20 });

        gsap.to(".footer-block", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: footerRef.current,
                start: "top 90%",
                toggleActions: "restart none none reverse",
            },
        });
    }, { scope: footerRef });

    return (
        <footer
            ref={footerRef}
            className="bg-bg-main border-t border-ink/10 px-8 md:px-16 pt-20 pb-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                <div className="footer-block max-w-md">
                    <h3 className="text-2xl md:text-3xl font-semibold text-ink mb-4 leading-snug">
                        Considered pieces, worn with intent.
                    </h3>
                    <p className="text-ink/60 text-sm leading-relaxed">
                        Snitch designs for people who dress with purpose. Every
                        piece cut to last, built to be worn until it's truly yours.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="footer-block mx-auto md:mx-0 md:justify-self-end w-full max-w-sm">
                    <label className="block font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40 mb-3">
                        Join The List
                    </label>
                    <div className="flex border-b border-ink/20 focus-within:border-thread transition-colors">
                        <input
                            type="email"
                            required
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ink/30"
                        />
                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/70 hover:text-thread transition-colors"
                        >
                            {status === "submitting" ? "..." : "Join"}
                        </button>
                    </div>
                    {status === "done" && (
                        <p className="text-xs text-ink/50 mt-2">You're on the list.</p>
                    )}
                    {status === "error" && (
                        <p className="text-xs text-ink mt-2">Something went wrong, try again.</p>
                    )}
                </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-16">
                {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                    <div key={heading} className="footer-block">
                        <h4 className="hairline pb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                            {heading}
                        </h4>
                        <ul className="space-y-2.5 mt-4">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <TransitionLink
                                        href={link.href}
                                        className="text-sm text-ink/70 hover:text-ink transition-colors"
                                    >
                                        {link.label}
                                    </TransitionLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="footer-block flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8 border-t border-ink/10 text-xs text-ink/40">
                <span>© {new Date().getFullYear()} Snitch. All rights reserved.</span>
                <div className="flex gap-6">
                    <TransitionLink href="/privacy" className="hover:text-ink transition-colors">Privacy</TransitionLink>
                    <TransitionLink href="/terms" className="hover:text-ink transition-colors">Terms</TransitionLink>
                </div>
            </div>
        </footer>
    );
}