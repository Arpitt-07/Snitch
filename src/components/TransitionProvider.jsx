// components/TransitionProvider.jsx
"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCursor } from '@/contexts/CursorContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const SAFETY_TIMEOUT_MS = 4000;
const NAV_TIMEOUT_MS = 5000;
const GSAP_S_CURVE = "power4.inOut";

const TransitionContext = createContext();

const timeoutPromise = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

export function TransitionProvider({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { setVariant } = useCursor();
    const reduce = useReducedMotion();

    const isAnimating = useRef(false);
    const pendingPathRef = useRef(null);
    const navTimeoutRef = useRef(null);

    const containerRef = useRef(null);
    const panelRef = useRef(null);
    const headingRef = useRef(null);
    const contentRef = useRef(null);
    const animRef = useRef({});

    useGSAP(() => {
        gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(panelRef.current, {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
        });
        gsap.set(headingRef.current, { autoAlpha: 0, y: 40 });

        animRef.current.cover = () => {
            return new Promise((resolve) => {

                const tl = gsap.timeline({ onComplete: resolve });
                gsap.set(containerRef.current, { visibility: 'visible', pointerEvents: 'auto' });

                if (reduce) {
                    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
                    return;
                }

                tl.to(panelRef.current, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 0.7,
                    ease: GSAP_S_CURVE
                }, 0)
                    .to(contentRef.current, { x: 80, duration: 0.7, ease: GSAP_S_CURVE }, 0)
                    .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.3");
            });
        };

        animRef.current.reveal = () => {
            return new Promise((resolve) => {
                gsap.set(contentRef.current, { x: -80 });
                const tl = gsap.timeline({
                    onComplete: () => {
                        gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });
                        gsap.set(panelRef.current, { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" });
                        resolve();
                    }
                });

                if (reduce) {
                    tl.to(containerRef.current, { opacity: 0, duration: 0.2 });
                    return;
                }
                tl.to(headingRef.current, { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" })
                    .to(panelRef.current, {
                        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
                        duration: 0.5,
                        ease: "power2.in"
                    }, "-=0.1")
                    .to(contentRef.current, { x: 0, duration: 0.6, ease: "power2.in" }, "-=0.6");
            });
        };

        return () => gsap.killTweensOf([containerRef.current, panelRef.current, headingRef.current, contentRef.current]);
    }, [reduce]);

    const forceReset = () => {
        gsap.killTweensOf([containerRef.current, panelRef.current, headingRef.current, contentRef.current]);
        gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none', opacity: 1 });
        gsap.set(panelRef.current, { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" });
        gsap.set(contentRef.current, { x: 0 });
        document.body.style.overflow = "";
        isAnimating.current = false;
    };

    const executeReveal = async () => {
        clearTimeout(navTimeoutRef.current);
        try {
            await Promise.race([animRef.current.reveal(), timeoutPromise(SAFETY_TIMEOUT_MS)]);
        } catch (e) {
            forceReset();
        } finally {
            document.body.style.overflow = "";
            isAnimating.current = false;
        }
    };

    // Only one useEffect needed: Listen for Next.js route completion
    useEffect(() => {
        if (pendingPathRef.current && pathname === pendingPathRef.current) {
            pendingPathRef.current = null;
            executeReveal();
        }
    }, [pathname]);

    const navigateWithTransition = async (href) => {
        if (href === pathname || isAnimating.current) return;

        isAnimating.current = true;
        document.body.style.overflow = "hidden";
        setVariant("default");

        const targetPath = href.split(/[?#]/)[0];
        pendingPathRef.current = targetPath;

        try {
            // Race the animation against the safety timeout
            await Promise.race([animRef.current.cover(), timeoutPromise(SAFETY_TIMEOUT_MS)]);
            router.push(href);

            // Backup timeout in case Next.js hangs on routing
            navTimeoutRef.current = setTimeout(() => {
                if (pendingPathRef.current === targetPath) {
                    pendingPathRef.current = null;
                    executeReveal();
                }
            }, NAV_TIMEOUT_MS);

        } catch (error) {
            forceReset();
            router.push(href);
        }
    };

    return (
        <TransitionContext.Provider value={{ navigateWithTransition }}>
            <div ref={contentRef}>
                {children}
            </div>
            <div
                ref={containerRef}
                className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none flex items-center justify-center"
                aria-hidden="true"
            >
                <div ref={panelRef} className="absolute inset-0 bg-ink" />
                <h1
                    ref={headingRef}
                    className="relative z-10 text-[15vw] md:text-[2vw] font-sans font-black uppercase tracking-tighter text-bg-main whitespace-nowrap"
                >
                    SNITCH
                </h1>
            </div>
        </TransitionContext.Provider>
    );
}

export const useTransitionRouter = () => useContext(TransitionContext);