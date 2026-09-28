"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import Button from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(SplitText);

const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

    const hideScrollbar =
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [active, setActive] = useState(0);
    const reduce = useReducedMotion();

    const titleRef = useRef(null);
    const detailsRef = useRef(null);
    const ctaRef = useRef(null);
    const trackRef = useRef(null);
    const drag = useRef({ down: false, startX: 0, startScroll: 0 });

    const dispatch = useDispatch();
    const cartStatus = useSelector((state) => state.cart.status);

    const images = selectedVariant?.images || [];
    useEffect(() => {
        api.get(`/products/${slug}`)
            .then((res) => {
                const data = res.data.data;
                setProduct(data);
                const firstVariant = data.variants?.[0] || null;
                setSelectedVariant(firstVariant);
                setSelectedSize(firstVariant?.sizes?.[0]?.size || null);
            })
            .catch((err) =>
                setError(err.response?.data?.message || "Product not found")
            );
    }, [slug]);

    useGSAP(
        () => {
            if (!product || reduce) return;

            const split = SplitText.create(titleRef.current, {
                type: "lines",
                linesClass: "overflow-hidden",
            });

            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

            tl.fromTo(
                split.lines,
                { yPercent: 110, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1 }
            ).fromTo(
                ".detail-item",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
                "-=0.6"
            );

            return () => split.revert();
        },
        { dependencies: [product, reduce], scope: detailsRef }
    );

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollTo({ left: 0, behavior: "auto" });
        setActive(0);
        if (!reduce) {
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
        }
    }, [selectedVariant?._id, reduce]);

    const goTo = (i) => {
        const el = trackRef.current;
        if (!el || images.length === 0) return;
        const index = Math.max(0, Math.min(images.length - 1, i));
        el.scrollTo({
            left: index * el.clientWidth,
            behavior: reduce ? "auto" : "smooth",
        });
    };

    const handleScroll = (e) => {
        const el = e.currentTarget;
        if (!el.clientWidth) return;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        if (index !== active) setActive(index);
    };
    const onPointerDown = (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        const el = trackRef.current;
        drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft };
        el.style.scrollSnapType = "none";
        el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!drag.current.down) return;
        const el = trackRef.current;
        el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
    };

    const endDrag = (e) => {
        if (!drag.current.down) return;
        const el = trackRef.current;
        const moved = drag.current.startX - e.clientX;
        drag.current.down = false;
        el.releasePointerCapture?.(e.pointerId);
        el.style.scrollSnapType = "";

        const threshold = el.clientWidth * 0.15;
        let index = Math.round(el.scrollLeft / el.clientWidth);
        if (Math.abs(moved) > threshold) {
            const base = Math.round(drag.current.startScroll / el.clientWidth);
            index = moved > 0 ? base + 1 : base - 1;
        }
        goTo(index);
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(active + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(active - 1);
        }
    };

    const handleAddToCart = async () => {
        const productId = product?._id;
        const variantId = selectedVariant?._id;
        const size = selectedSize;

        if (!productId || !variantId || !size) {
            alert("Please select a color and size first.");
            return;
        }

        try {
            await dispatch(
                addToCart({ productId, variantId, size, quantity: 1 })
            ).unwrap();

            if (!reduce) {
                gsap.to(ctaRef.current, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut",
                });
            }
        } catch (err) {
            console.error("Add to Cart Error:", err);
            alert(err?.response?.data?.message || err || "Failed to add item to cart");
        }
    };

    const handleVariantSelect = (v, e) => {
        setSelectedVariant(v);
        setSelectedSize(v?.sizes?.[0]?.size || null);
        if (!reduce && e?.currentTarget) {
            gsap.fromTo(
                e.currentTarget,
                { scale: 1 },
                { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 }
            );
        }
    };
    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs">
                {error}
            </div>
        );
    if (!product)
        return (
            <div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs">
                Loading...
            </div>
        );

    return (
        <div className="bg-bg-main text-ink pt-12 pb-16 mt-12 md:mt-20">
            <div className="px-4 md:px-8 grid grid-cols-1 md:grid-cols-[62%_38%] items-start">
                <div className="min-w-0 md:pr-10 lg:pr-16">
                    {images.length > 0 && (
                        <div className="relative">
                            <div
                                ref={trackRef}
                                tabIndex={0}
                                role="region"
                                aria-roledescription="carousel"
                                aria-label={`${product.title} images`}
                                onScroll={handleScroll}
                                onKeyDown={onKeyDown}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={endDrag}
                                onPointerCancel={endDrag}
                                className={`flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain select-none md:cursor-grab md:active:cursor-grabbing focus:outline-none ${hideScrollbar}`}
                            >
                                {images.map((img, i) => (
                                    <div
                                        key={img.fileId || i}
                                        className="w-full shrink-0 snap-center flex justify-center"
                                    >
                                        <div className="relative aspect-4/5 w-full md:w-auto md:h-[calc(100vh-10rem)] max-w-full bg-bg-main border border-ink/10">
                                            <span className="absolute top-4 left-4 z-20 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60 bg-bg-main/80 px-2 py-1 backdrop-blur-sm rounded-sm">
                                                {String(i + 1).padStart(2, "0")} /{" "}
                                                {String(images.length).padStart(2, "0")}
                                            </span>

                                            <img
                                                src={img.url}
                                                alt={`${product.title}, view ${i + 1}`}
                                                className="w-full h-full object-cover block pointer-events-none"
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => goTo(active - 1)}
                                        disabled={active === 0}
                                        aria-label="Previous image"
                                        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center border border-ink/20 bg-bg-main/80 backdrop-blur-sm text-ink transition-opacity hover:bg-bg-main disabled:opacity-0 disabled:pointer-events-none"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15 5l-7 7 7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => goTo(active + 1)}
                                        disabled={active === images.length - 1}
                                        aria-label="Next image"
                                        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center border border-ink/20 bg-bg-main/80 backdrop-blur-sm text-ink transition-opacity hover:bg-bg-main disabled:opacity-0 disabled:pointer-events-none"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    aria-label={`Go to image ${i + 1}`}
                                    className={`h-1.5 transition-all duration-300 ${
                                        active === i ? "w-6 bg-ink" : "w-1.5 bg-ink/25"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div
                    ref={detailsRef}
                    className="mt-10 md:mt-0 md:sticky md:top-16 md:border-l border-ink/10 pl-0 md:pl-8"
                >
                    <div className="flex flex-col space-y-8">

                        <div>
                            <p className="detail-item font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                                REF {product._id.slice(-6)}
                            </p>
                            <h1
                                ref={titleRef}
                                className="mt-3 text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] break-words"
                            >
                                {product.title}
                            </h1>
                        </div>

                        <div className="detail-item space-y-2">
                            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40">
                                Price
                            </span>
                            <p className="text-3xl font-medium font-mono">
                                {formatPrice(product.basePrice)}
                            </p>
                        </div>

                        <p className="detail-item text-sm leading-relaxed text-ink/70 max-w-sm">
                            {product.description}
                        </p>

                   
                        <div className="detail-item space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/60">
                                    Colour
                                </span>
                                <div className="h-px flex-1 bg-ink/10"></div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((v, i) => (
                                    <button
                                        key={v._id || i}
                                        onClick={(e) => handleVariantSelect(v, e)}
                                        className={`w-10 h-10 rounded-[3px] transition-all duration-300 flex-shrink-0 ${
                                            selectedVariant?._id === v._id
                                                ? "ring-2 ring-ink ring-offset-2 ring-offset-bg-main scale-110"
                                                : "border border-ink/15 opacity-80 hover:opacity-100"
                                        }`}
                                        style={{ backgroundColor: v.colorCode }}
                                        aria-label={`Colour ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                
                        <div className="detail-item space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/60">
                                    Size
                                </span>
                                <div className="h-px flex-1 bg-ink/10"></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedVariant?.sizes.map((s) => (
                                    <button
                                        key={s.size}
                                        onClick={() => setSelectedSize(s.size)}
                                        className={`relative py-3.5 px-4 border text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                                            selectedSize === s.size
                                                ? "border-ink bg-ink text-bg-main scale-[1.02]"
                                                : "border-ink/15 text-ink hover:border-ink/60"
                                        }`}
                                    >
                                        {s.size}
                                        {selectedSize === s.size && (
                                            <span
                                                className="absolute -top-1 -right-1 h-2 w-2 bg-ink"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div ref={ctaRef} className="detail-item pt-2">
                            <Button
                                variant="primary"
                                onClick={handleAddToCart}
                                disabled={
                                    !selectedVariant ||
                                    !selectedSize ||
                                    cartStatus === "loading"
                                }
                                className="w-full"
                            >
                                {cartStatus === "loading" ? "Adding..." : "Add to Cart"}
                            </Button>
                            {(!selectedVariant || !selectedSize) && (
                                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                                    Select a colour and size to continue
                                </p>
                            )}
                        </div>

                        <div className="detail-item pt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/40 text-right">
                            The Cut / AW26
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}