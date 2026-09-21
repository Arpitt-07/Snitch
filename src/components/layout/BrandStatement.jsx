// src/components/layout/BrandStatement.jsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

export default function BrandStatement() {
    const sectionRef = useRef(null);
    const textRef = useRef(null);
    const mediaContainerRef = useRef(null);
    const mediaRef = useRef(null);
    const reduce = useReducedMotion();

    useGSAP(() => {
        const split = SplitText.create(textRef.current, {
            type: "lines",
            linesClass: "overflow-hidden",
        });

        const lines = split.lines;

        if (!reduce) {
            gsap.set(lines, { yPercent: 110 });

            gsap.to(lines, {
                yPercent: 0,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    end: "top 60%",
                    scrub: true,
                },
            });

            gsap.set(mediaContainerRef.current, { clipPath: "inset(49% 0% 49% 0%)", scale: 1.1, opacity: 1 });
            gsap.set(mediaRef.current, { scale: 1.1 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 30%",
                    toggleActions: "restart none none reverse",
                    onLeaveBack: () => {
                        gsap.set(mediaContainerRef.current, { clipPath: "inset(49% 0% 49% 0%)", scale: 1.1, opacity: 1 });
                        gsap.set(mediaRef.current, { scale: 1.1 });
                    },
                }
            });

            tl.to(mediaContainerRef.current, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.5,
                ease: "expo.out",
            })
            .to(mediaRef.current, {
                scale: 1,
                duration: 1.5,
                ease: "expo.out",
            }, "<");
        } else {
            gsap.set(mediaContainerRef.current, { opacity: 0 });
            gsap.to([textRef.current, mediaContainerRef.current], {
                opacity: 1,
                duration: 1.2,
                stagger: 0.7,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 40%",
                    toggleActions: "restart none none reverse",
                },
            });
        }

        return () => {
            split.revert();
        };
    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            className="px-8 md:px-16 py-32 md:py-48 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
            <div className="lg:col-span-7 z-10">
                <div
                    aria-hidden="true"
                    className="mb-8 h-[2px] w-12 bg-ink"
                />
                <p
                    ref={textRef}
                    className="text-ink text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.18] max-w-[65ch]"
                >
                    We make clothes for people who dress on purpose. Considered
                    pieces, cut to last, worn until they are truly yours.
                </p>
            </div>
            <div className="lg:col-span-5 w-full h-[60vh] lg:h-[80vh] relative overflow-hidden">
                <div
                    ref={mediaContainerRef}
                    className="w-full h-full relative"
                >
                    <img
                        ref={mediaRef}
                        src="https://images.pexels.com/photos/30977553/pexels-photo-30977553.jpeg"
                        alt="Editorial brand view"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}