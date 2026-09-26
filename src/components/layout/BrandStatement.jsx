
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
            mask: "lines",
        });

        const lines = split.lines;
        const mm = gsap.matchMedia();

        if (!reduce) {
            gsap.set(lines, { yPercent: 110 });
            mm.add(
                {
                    isMobile: "(max-width: 767px)",
                    isDesktop: "(min-width: 768px)",
                },
                (context) => {
                    const { isMobile } = context.conditions;

                    gsap.to(lines, {
                        yPercent: 0,
                        stagger: 0.1,
                        duration: 2,
                        ease: "cubic-bezier(0.23, 1, 0.32, 1)",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: isMobile ? "top 80%" : "top 30%",
                            end: "top top",
                            scrub: true,
                        },
                    });
                }
            );

            gsap.set(mediaContainerRef.current, { clipPath: "inset(100% 0% 0% 0%)", scale: 1.05, opacity: 1 });
            gsap.set(mediaRef.current, { scale: 1.05 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 30%",
                    toggleActions: "play none none reverse",
                }
            });

            tl.to(mediaContainerRef.current, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
            })
            .to(mediaRef.current, {
                scale: 1,
                duration: 1.2,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
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
            mm.revert();
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
                    className="text-ink text-2xl  md:text-5xl lg:text-6xl font-semibold leading-[1.18] max-w-[65ch]"
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
                        src="/images/4.webp"
                        alt="Editorial brand view"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}