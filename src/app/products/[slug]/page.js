// src/app/products/[slug]/page.js
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import ProductGallery from "@/components/ui/ProductGallery";
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

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const reduce = useReducedMotion();

    const titleRef = useRef(null);
    const detailsRef = useRef(null);
    const ctaRef = useRef(null);

    const dispatch = useDispatch();
    const cartStatus = useSelector((state) => state.cart.status);

    useEffect(() => {
        api.get(`/products/${slug}`)
            .then((res) => {
                const data = res.data.data;
                setProduct(data);
                const firstVariant = data.variants?.[0] || null;
                setSelectedVariant(firstVariant);
                setSelectedSize(firstVariant?.sizes?.[0]?.size || null);
            })
            .catch((err) => setError(err.response?.data?.message || "Product not found"));
    }, [slug]);

    useGSAP(() => {
        if (!product || reduce) return;

        // Title reveal: SplitText lines reveal
        const split = SplitText.create(titleRef.current, {
            type: "lines",
            linesClass: "overflow-hidden",
        });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.fromTo(split.lines,
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1 }
        )
        .fromTo(".detail-item",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
            "-=0.6"
        );

        return () => split.revert();
    }, { dependencies: [product, reduce], scope: detailsRef });

    const handleAddToCart = async () => {
        const productId = product?._id;
        const variantId = selectedVariant?._id;
        const size = selectedSize;

        if (!productId || !variantId || !size) {
            alert("Please select a color and size first.");
            return;
        }

        try {
            await dispatch(addToCart({
                productId,
                variantId,
                size,
                quantity: 1,
            })).unwrap();

            // Success Micro-animation
            if (!reduce) {
                gsap.to(ctaRef.current, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        } catch (err) {
            console.error("Add to Cart Error:", err);
            alert(err?.response?.data?.message || err || "Failed to add item to cart");
        }
    };

    const handleVariantSelect = (v) => {
        setSelectedVariant(v);
        if (!reduce) {
            gsap.fromTo(v._id, { scale: 1 }, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
        }
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        if (!reduce) {
            // Simple scale pulse for the button
            // Since we don't have a ref for each size button, we can use a selector
            // or just rely on the CSS transition for the basic part and GSAP for the "pop"
        }
    };

    if (error) {
        return <div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs">{error}</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-bg-main text-ink px-4 md:px-8 py-12">
            <div className="mb-12 md:mb-16">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                    REF {product._id.slice(-6)}
                </p>
                <h1 ref={titleRef} className="mt-3 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] break-words">
                    {product.title}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Gallery: Col 1-8 */}
                <div className="md:col-span-8 w-full md:pr-10 lg:pr-16">
                    <ProductGallery images={selectedVariant?.images || []} title={product.title} />
                </div>

                {/* Details: Col 9-12 */}
                <div ref={detailsRef} className="md:col-span-4 w-full md:border-l border-ink/10 pl-0 md:pl-8 py-4 md:sticky md:top-24 h-fit space-y-12 mt-12 md:mt-0">

                    {/* Price */}
                    <div className="detail-item space-y-2">
                        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40">Price</span>
                        <p className="text-3xl font-medium font-mono">
                            {formatPrice(product.basePrice)}
                        </p>
                    </div>

                    <p className="detail-item text-sm leading-relaxed text-ink/70 max-w-sm">
                        {product.description}
                    </p>

                    {/* Colour */}
                    <div className="detail-item space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/60">Colour</span>
                            <div className="h-px flex-1 bg-ink/10"></div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((v, i) => (
                                <button
                                    key={v._id || i}
                                    onClick={() => handleVariantSelect(v)}
                                    className={`w-10 h-10 rounded-[3px] transition-all duration-300 flex-shrink-0 ${
                                        selectedVariant?._id === v._id
                                            ? 'ring-2 ring-ink ring-offset-2 ring-offset-bg-main scale-110'
                                            : 'border border-ink/15 opacity-70 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: v.colorCode }}
                                    aria-label={`Colour ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="detail-item space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/60">Size</span>
                            <div className="h-px flex-1 bg-ink/10"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedVariant?.sizes.map(s => (
                                <button
                                    key={s.size}
                                    onClick={() => setSelectedSize(s.size) }
                                    className={`relative py-3.5 px-4 border text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                                        selectedSize === s.size
                                            ? 'border-ink bg-ink text-bg-main scale-[1.02]'
                                            : 'border-ink/15 text-ink hover:border-ink/60'
                                    }`}
                                >
                                    {s.size}
                                    {selectedSize === s.size && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-ink" aria-hidden="true" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div ref={ctaRef} className="detail-item pt-4">
                        <Button
                            variant="primary"
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || !selectedSize || cartStatus === "loading"}
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

                    <div className="detail-item pt-12 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/40 text-right">
                        The Cut / AW26
                    </div>
                </div>
            </div>
        </div>
    );
}
