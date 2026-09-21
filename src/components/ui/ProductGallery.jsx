// src/components/ui/ProductGallery.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ProductGallery({ images = [], title }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const mainImageRef = useRef(null);
    const reduce = useReducedMotion();

    // whenever the image set changes (e.g. switching color variant), go back to the first image
    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    useGSAP(() => {
        if (reduce || !mainImageRef.current) return;
        gsap.fromTo(
            mainImageRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
    }, { dependencies: [activeIndex, reduce] });

    if (images.length === 0) return null;

    // defensive fallback — never let an out-of-range index crash the render
    const activeImage = images[activeIndex] || images[0];
    if (!activeImage) return null;

    return (
        <div className="flex flex-col-reverse md:flex-row gap-3">
            {images.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:w-20 shrink-0 scrollbar-hide">
                    {images.map((img, i) => (
                        <button
                            key={img.fileId || i}
                            onClick={() => setActiveIndex(i)}
                            aria-label={`View ${i + 1}`}
                            className={`relative shrink-0 w-16 h-20 md:w-full md:h-24 overflow-hidden border transition-colors duration-300 ${
                                i === activeIndex ? "border-ink" : "border-ink/15 hover:border-ink/50"
                            }`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="relative flex-1 bg-bg-main border border-ink/10 overflow-hidden">
                <span className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>

                <img
                    ref={mainImageRef}
                    key={activeImage.fileId || activeIndex}
                    src={activeImage.url}
                    alt={`${title}, view ${activeIndex + 1}`}
                    className="w-full aspect-[4/5] object-cover"
                />
            </div>
        </div>
    );
}