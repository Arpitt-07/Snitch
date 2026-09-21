// src/components/layout/JournalTeaser.jsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import { useCursor } from "@/contexts/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const POSTS = [
    {
        slug: "the-art-of-layering",
        category: "Styling Guide",
        title: "The art of layering for transitional weather",
        image: "/images/5.webp",
    },
    {
        slug: "how-its-made-denim",
        category: "How It's Made",
        title: "Inside our raw denim process, from thread to finish",
        image: "/images/6.webp",
    },
    {
        
        slug: "ss26-story",
        category: "Seasonal Story",
        title: "S/S 2026, a study in restraint",
        image: "/images/product_jacket.webp",
    },
];

function JournalCard({ post }) {
    const imgRef = useRef(null);
    const { setVariant } = useCursor();
    const reduce = useReducedMotion();

    const handleEnter = () => {
        if (reduce) return;
        gsap.to(imgRef.current, { scale: 1.05, duration: 0.7, ease: "power3.out" });
        setVariant("view");
    };
    const handleLeave = () => {
        if (reduce) return;
        gsap.to(imgRef.current, { scale: 1, duration: 0.7, ease: "power3.out" });
        setVariant("default");
    };

    return (
        <TransitionLink
            href={`/journal/${post.slug}`}
            className="journal-card group block"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
                <img
                    ref={imgRef}
                    src={post.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover will-change-transform"
                />
            </div>
            <div className="mt-5 hairline pt-4">
                <span className="block font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40">
                    {post.category}
                </span>
                <h3 className="mt-2 text-xl font-semibold leading-snug text-ink">
                    {post.title}
                </h3>
            </div>
        </TransitionLink>
    );
}

export default function JournalTeaser() {
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();

    useGSAP(() => {
        if (reduce) return;

        // Mask-wipe reveal for cards
        gsap.set(".journal-card", {
            opacity: 0,
            clipPath: "inset(0 0 100% 0)"
        });

        gsap.to(".journal-card", {
            opacity: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.2,
            stagger: 0.2,
            ease: "expo.out",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "restart none none reverse",
                onLeaveBack: (self) => {
                    gsap.set(".journal-card", {
                        opacity: 0,
                        clipPath: "inset(0 0 100% 0)"
                    });
                },
            },
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="px-8 md:px-16 py-24 md:py-32">
            <div className="mb-12 flex items-end justify-between gap-6">
                <div className="reveal-text">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                        The Journal
                    </p>
                    <h2 className="mt-3 text-4xl md:text-5xl font-black uppercase tracking-tighter text-ink">
                        From The Journal
                    </h2>
                </div>
                <TransitionLink
                    href="/journal"
                    className="hidden md:inline-block text-[11px] font-bold uppercase tracking-[0.24em] text-ink/50 hover:text-ink transition-colors"
                >
                    View All
                </TransitionLink>
            </div>
            <div className="hairline" />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {POSTS.map((post) => (
                    <JournalCard key={post.slug} post={post} />
                ))}
            </div>
        </section>
    );
}