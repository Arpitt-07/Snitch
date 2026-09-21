"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import ProductCard from "@/components/ui/ProductCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CollectionSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const gridRef = useRef(null);
    const reduce = useReducedMotion();

    // Fetch products locally within the component
    useEffect(() => {
        api.get("/products")
            .then((res) => {
                setProducts(res.data.data.products);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useGSAP(() => {
        if (loading || reduce || !products?.length) return;

        ScrollTrigger.batch(".product-card-wrapper", {
            onEnter: (batch) => {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "expo.out",
                });
            },
            onLeaveBack: (batch) => {
                gsap.set(batch, { opacity: 0, y: 48, scale: 0.95 });
            },
            start: "top 90%",
        });
    }, {
        dependencies: [reduce, products, loading],
        scope: gridRef
    });

    return (
        <section className="px-8 md:px-16 py-24 lg:py-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="max-w-2xl">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                        The Collection
                    </p>
                    <h2 className="mt-3 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-ink">
                        Our Collection
                    </h2>
                    <p className="mt-6 text-ink/60 text-lg max-w-md leading-relaxed">
                        A curated selection of precision-cut essentials. Designed for the urban landscape, built for longevity.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                        S/S 2026 Edition
                    </span>
                </div>
            </div>

            {loading ? (
                // Loading Skeleton (scoped only to the grid area so the headers stay visible)
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-[2px] border border-ink/5" />
                    ))}
                </div>
            ) : (
                // Actual Data Grid
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:grid-flow-row-dense gap-x-6 gap-y-6"
                >
                    {products.map((product, index) => {
                        const layoutPosition = index % 4;
                        let spanClass = "col-span-1 sm:col-span-2";

                        if (layoutPosition === 0) {
                            spanClass += " lg:col-span-6 lg:row-span-2";
                        } else if (layoutPosition === 1) {
                            spanClass += " lg:col-span-3 lg:row-span-1";
                        } else if (layoutPosition === 2) {
                            spanClass += " lg:col-span-3 lg:row-span-1";
                        } else if (layoutPosition === 3) {
                            spanClass += " lg:col-span-6 lg:row-span-1";
                        }

                        return (
                            <div
                                key={product._id}
                                className={`product-card-wrapper opacity-0 translate-y-12 scale-95 h-full ${spanClass}`}
                            >
                                <ProductCard
                                    product={product}
                                    showCursorEffect={true}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}