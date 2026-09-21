"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(SplitText, useGSAP, CustomEase);
CustomEase.create('hop', '0.8, 0, 0.2, 1');
CustomEase.create('hop2', '0.9, 0, 0.1, 1');

const images = [
    "/images/1.webp",
    "/images/2.webp",
    "/images/3.webp",
    "/images/4.webp",
    "/images/5.webp",
    "/images/6.webp"
];

const preloaderImgInitRotations = [7.5, -2.5, -10, 12.5, -5, 5];

export default function Preloader({ onLoaded }) {
    const reduce = useReducedMotion();
    const [isComplete, setIsComplete] = useState(false);
    const containerRef = useRef(null);
    const counterRef = useRef(null);
    const fallbackTimerRef = useRef(null);

    // Fallback timer to ensure the app loads even if animations fail
    useEffect(() => {
        fallbackTimerRef.current = setTimeout(() => {
            if (!isComplete) {
                onLoaded?.();
                setIsComplete(true);
            }
        }, 8000);
        return () => clearTimeout(fallbackTimerRef.current);
    }, [isComplete, onLoaded]);

    // Scroll lock while preloader is active
    useEffect(() => {
        if (!isComplete) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isComplete]);

    useGSAP(() => {
        const imgEls = gsap.utils.toArray('.preloader-img');

        gsap.set(imgEls, {
            xPercent: -50,
            yPercent: -50,
            y: (i) => -18 - i * 4,
            scale: 0,
            rotate: (i) => preloaderImgInitRotations[i],
        });

        const splitHeader = SplitText.create('.preloader-header h1', {
            type: 'chars',
        });

        // Immediately set initial hidden states for GSAP
        gsap.set(splitHeader.chars, { yPercent: 100, });
        gsap.set(counterRef.current, { y: 0, yPercent: 100 });
        gsap.set('.preloader-header', { autoAlpha: 1 });

        const counterObj = { value: 0 };
        const tl = gsap.timeline({ delay: 0.5 });

        if (reduce) {
            tl.to('.preloader-header', { autoAlpha: 1, duration: 0.4 })
                .to('.preloader-header', { autoAlpha: 0, duration: 0.4, delay: 0.8, onStart: () => onLoaded?.() })
                .to(containerRef.current, {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                    duration: 0.6,
                    ease: 'power3.out',
                    onComplete: () => setIsComplete(true)
                });
        } else {
            tl.to(imgEls, {
                scale: 1,
                y: 0,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                duration: 1,
                ease: 'hop',
                stagger: 0.2,
            })
                .to(splitHeader.chars, {
                    yPercent: 0,
                    duration: 1,
                    ease: 'hop2',
                    stagger: 0.08
                }, 0.35)
                .to(counterRef.current, {
                    y: 0,
                    yPercent: 0,
                    duration: 1,
                    ease: 'hop2'
                }, 0.35)
                .to(counterObj, {
                    value: 100,
                    duration: 2,
                    delay: 0.5,
                    ease: 'expo.out',
                    onUpdate: () => {
                        if (counterRef.current) {
                            counterRef.current.textContent = String(Math.round(counterObj.value)).padStart(3, '0');
                        }
                    }
                }, 0.35)
                .to(imgEls, {
                    rotate: (i) => preloaderImgInitRotations[i] + (i % 2 === 0 ? 1.5 : -1.5),
                    duration: 2,
                    ease: 'hop2',
                }, 0.35)

                // EXIT ANIMATIONS (all sync to start at 3.25)
                .to(splitHeader.chars, {
                    yPercent: -100,
                    duration: 0.75,
                    ease: 'hop2',
                    stagger: 0.05
                }, 3.25)
                .to(counterRef.current, {
                    yPercent: -100,
                    duration: 0.75,
                    ease: 'hop2'
                }, 3.25)

                .to(imgEls, {
                    scale: 0,
                    clipPath: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)',
                    duration: 1,
                    ease: 'hop2',
                    stagger: -0.075,
                    onStart: () => onLoaded?.()
                }, 3.5)
                .to(containerRef.current, {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                    duration: 1,
                    ease: 'power3.out',
                    onComplete: () => setIsComplete(true)
                }, 4.35);
        }

        return () => {
            tl.kill();
            splitHeader.revert();
        };
    }, { scope: containerRef });

    if (isComplete) return null;

    return (
        <div
            className="preloader bg-ink"
            ref={containerRef}
            role="status"
            aria-label="Loading Snitch"
            aria-busy={!isComplete}
        >
            {images.map((imgSrc, i) => (
                <img
                    key={i}
                    src={imgSrc}
                    alt=""
                    className="preloader-img object-cover z-10"
                    aria-hidden="true"
                />
            ))}

            <div className="preloader-header z-20 pointer-events-none mix-blend-difference">
                <div className="overflow-hidden">
                    <h1 className="uppercase text-[3rem] sm:text-[5rem] text-white leading-none font-bold">
                        SNITCH
                    </h1>
                </div>
                <div className="preloader-counter">
                    <p ref={counterRef} className="text-2xl sm:text-3xl text-white" aria-hidden="true">
                        000
                    </p>
                </div>
            </div>
        </div>
    );
}