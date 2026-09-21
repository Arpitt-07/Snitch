"use client";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCursor } from "@/contexts/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function useHasFinePointer() {
    const [hasFine, setHasFine] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        setHasFine(mq.matches);
        
        const handler = (e) => setHasFine(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return hasFine;
}

export default function CustomCursor() {
    const dotRef = useRef(null);
    const { variant } = useCursor();
    const quickX = useRef(null);
    const quickY = useRef(null);
    const hasFinePointer = useHasFinePointer();
    const reduce = useReducedMotion();
    
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useGSAP(() => {
        if (!hasFinePointer || reduce || !dotRef.current) return;

        gsap.set(dotRef.current, { xPercent: -50, yPercent: -50 });
        
        quickX.current = gsap.quickTo(dotRef.current, "x", { duration: 0.5, ease:'power2.out' });
        quickY.current = gsap.quickTo(dotRef.current, "y", { duration: 0.5, ease: "power2.out" });

        const handleMove = (e) => {
            quickX.current(e.clientX);
            quickY.current(e.clientY);
        };

        window.addEventListener("mousemove", handleMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMove);
    }, [hasFinePointer, reduce, mounted]);

    useEffect(() => {
        if (!hasFinePointer || !dotRef.current || reduce) return;
        
        const isView = variant === "view";
        
        gsap.to(dotRef.current, {
            scale: isView ? 1 : (6 / 70),
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto"
        });
    }, [variant, hasFinePointer, reduce, mounted]);

    useEffect(() => {
        if (hasFinePointer && !reduce) {
            document.body.classList.add("custom-cursor-active");
        } else {
            document.body.classList.remove("custom-cursor-active");
        }
        return () => document.body.classList.remove("custom-cursor-active");
    }, [hasFinePointer, reduce]);
    if (!hasFinePointer || reduce || !mounted) return null;

    const isView = variant === "view";
    return createPortal(
        <div
            ref={dotRef}
            className="fixed top-0 left-0 flex items-center justify-center pointer-events-none z-[10001] rounded-full will-change-transform mix-blend-difference text-white"
            style={{ width: 70, height: 70 }}
        >
            <div
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isView
                        ? "border border-white "
                        : "bg-white"
                }`}
            />
            <span
                className={`text-[9px] font-bold uppercase tracking-[0.3em] transition-opacity duration-300 ${
                    isView ? "opacity-100 text-white" : "opacity-0 text-black"
                }`}
            >
                View
            </span>
        </div>,
        document.body
    );
}