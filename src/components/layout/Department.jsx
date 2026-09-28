"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import { useCursor } from "@/contexts/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Image from "next/image";


gsap.registerPlugin(ScrollTrigger, useGSAP);

const DEPARTMENTS = [
    { name: "Menswear", slug: "Menswear", image: "/images/Menswear.jpg" },
    { name: "Womenswear", slug: "Womenswear", image: "/images/Womenswear.jpg" },
    { name: "Accessories", slug: "Accessories", image: "/images/accessories.jpg" },
];

function DepartmentTile({ department, index }) {
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const { setVariant } = useCursor();
    const reduce = useReducedMotion();

    const handleEnter = () => {
        if (reduce) return;
        gsap.to(imgRef.current, { scale: 1.06, duration: 0.7, ease: "power3.out" });
        setVariant("view");
    };

    const handleLeave = () => {
        if (reduce) return;
        gsap.to(imgRef.current, { scale: 1, duration: 0.7, ease: "power3.out" });
        setVariant("default");
    };

    return (
        <TransitionLink
            href={`/products?department=${department.slug}`}
            className="group relative block h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full overflow-hidden"
            >
                <Image
                    ref={imgRef}
                    src={department.image}
                    alt={department.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />

            <div className="absolute top-8 right-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/60">
                    0{index + 1}
                </span>
            </div>

            <div className="absolute bottom-8 left-8">
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                    Department
                </span>
                <span
                    aria-hidden="true"
                    className="block my-3 h-px w-10 bg-white/30"
                />
                <span className="block text-white text-2xl md:text-3xl font-semibold uppercase tracking-tight">
                    {department.name}
                </span>
            </div>
        </TransitionLink>
    );
}

export default function ShopByDepartment() {
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();

    useGSAP(() => {
        if (reduce) {
            gsap.set(".department-tile", {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)"
            });
            return;
        }

        gsap.set(".department-tile", {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)"
        });

        gsap.to(".department-tile", {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.4,
            stagger: 0.15,
            ease: "cubic-bezier(0.23, 1, 0.32, 1)",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="px-8 md:px-16 pb-24 md:pb-32">
            <div className="mb-12 flex items-end justify-between gap-6">
                <div className="reveal-text">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                        The Departments
                    </p>
                    <h2 className="mt-3 text-4xl md:text-5xl font-black uppercase tracking-tighter text-ink">
                        Shop The Edit
                    </h2>
                </div>
                <TransitionLink
                    href="/products"
                    className="hidden md:inline-block text-[11px] font-bold uppercase tracking-[0.24em] text-ink/50 hover:text-ink transition-colors"
                >
                    View All
                </TransitionLink>
            </div>
            <div className="hairline" />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEPARTMENTS.map((dept, i) => (
                    <div key={dept.slug} className="department-tile">
                        <DepartmentTile department={dept} index={i} />
                    </div>
                ))}
            </div>
        </section>
    );
}
