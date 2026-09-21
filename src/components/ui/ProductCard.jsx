import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import TransitionLink from '../TransitionLink';
import { useCursor } from '@/contexts/CursorContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ProductCard = ({ product, showCursorEffect = false }) => {
    const { title, category, basePrice, discountPrice, variants, slug } = product;
    const reduce = useReducedMotion();

    const image1Url = variants?.[0]?.images?.[0]?.url;
    const image2Url = variants?.[0]?.images?.[1]?.url;

    const totalStock = variants?.reduce(
        (sum, v) => sum + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0),
        0
    ) || 0;
    const isSoldOut = totalStock === 0;

    const image1Ref = useRef(null);
    const image2Ref = useRef(null);
    const tlRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { setVariant } = useCursor();

    useEffect(() => {
        if (!image1Ref.current || !image2Ref.current) return;

        gsap.set(image2Ref.current, { opacity: 0, scale: 1.05 });

        if (reduce) return;

        tlRef.current = gsap.timeline({ paused: true })
            .to(image1Ref.current, {
                scale: 1.05,
                duration: 0.8,
                ease: "expo.out",
            }, 0)
            .to(image2Ref.current, {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "expo.out",
            }, 0);

        return () => {
            if (tlRef.current) tlRef.current.kill();
        };
    }, []);

    const handleEnter = () => {
        if (!reduce && tlRef.current) tlRef.current.play();
        if (showCursorEffect) setVariant("view");
    };

    const handleLeave = () => {
        if (!reduce && tlRef.current) tlRef.current.reverse();
        if (showCursorEffect) setVariant("default");
    };

    const hasDiscount = discountPrice != null && discountPrice < basePrice;

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <TransitionLink
            href={`/products/${slug}`}
            className="group w-full flex flex-col bg-white cursor-none relative block border border-ink/10 rounded-[2px]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-[2px] bg-gray-100">
                {image1Url ? (
                    <>
                        <img
                            ref={image1Ref}
                            src={image1Url}
                            alt={title}
                            loading="lazy"
                            decoding="async"
                            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${isLoaded ? 'blur-0 opacity-100' : 'blur-xl opacity-40'}`}
                            onLoad={() => setIsLoaded(true)}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        {!isLoaded && (
                            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-mono uppercase opacity-40">
                        No image
                    </div>
                )}

                {image2Url && (
                    <img
                        ref={image2Ref}
                        src={image2Url}
                        alt={`${title} alternate view`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                )}

                {isSoldOut && (
                    <span className="absolute top-4 left-4 bg-ink text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 z-10">
                        Sold out
                    </span>
                )}
            </div>

            <div className="p-4 flex flex-col gap-3 bg-white border-t border-ink/10 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <h2 className="text-[15px] font-semibold uppercase tracking-tight leading-tight truncate text-ink">
                        {title}
                    </h2>
                    <span className="text-sm font-mono font-medium text-ink whitespace-nowrap">
                        {hasDiscount && (
                            <span className="text-ink/40 line-through mr-2 text-xs">
                                {formatPrice(basePrice)}
                            </span>
                        )}
                        {formatPrice(hasDiscount ? discountPrice : basePrice)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink/40">
                        {category}
                    </p>
                    <div className="w-2 h-2 bg-ink rounded-full group-hover:scale-150 transition-transform duration-300" />
                </div>
            </div>
        </TransitionLink>
    );
};

export default ProductCard;