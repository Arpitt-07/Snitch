// src/app/cart/page.js
"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import TransitionLink from "@/components/TransitionLink";
import { fetchCart, updateCartItem, removeCartItem } from "@/store/cartSlice";
import Button from "@/components/ui/Button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function CartPage() {
    const dispatch = useDispatch();
    const { items, total, status } = useSelector((state) => state.cart);
    const reduce = useReducedMotion();
    const containerRef = useRef(null);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleQuantityChange = (itemId, quantity) => {
        if (quantity < 1) return;
        dispatch(updateCartItem({ itemId, quantity }));
    };

    const handleRemove = async (itemId, el) => {
        if (!reduce) {
            await gsap.to(el, {
                opacity: 0,
                x: -30,
                height: 0,
                margin: 0,
                padding: 0,
                duration: 0.5,
                ease: "power3.in"
            });
        }
        dispatch(removeCartItem(itemId));
    };

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    useGSAP(() => {
        if (status !== "idle" || items.length === 0 || reduce) return;

        gsap.from(".ledger-row", {
            opacity: 1,
            x: -30,
            duration: 1,
            stagger: 0.1,
            ease: "expo.out",
        });
    }, { dependencies: [status, items], scope: containerRef });

    if (status === "loading" && items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs text-ink/40">
                Loading manifest...
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-bg-main text-ink p-8 flex flex-col justify-center items-center text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                    Your Bag
                </p>
                <h1 className="mt-3 text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">
                    Empty
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/50 mb-12">
                    No items currently assigned to this manifest.
                </p>
                <Button href="/products" variant="primary">
                    Browse Collection
                </Button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-bg-main text-ink p-4 md:p-12 pt-32">
            {/* Bag Manifest Header */}
            <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-ink/10 pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-ink rounded-full animate-pulse" />
                            System Active
                        </span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">Bag_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                        Your Bag
                    </h1>
                </div>
                <div className="text-right">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 mb-1">
                        Manifest Count
                    </p>
                    <p className="text-3xl font-mono font-bold">
                        {items.length} <span className="text-sm uppercase font-medium opacity-50">Units</span>
                    </p>
                </div>
            </header>
            <div className="grid-cols-1 gap-0 overflow-hidden">
                <div className=" grid-cols-12 gap-4 px-4 py-3 border-b border-ink/20 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 hidden md:grid">
                    <div className="col-span-2">Item</div>
                    <div className="col-span-5">Details</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Line Total</div>
                </div>

                {items.map((item) => (
                    <div
                        key={item._id}
                        className="ledger-row grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-ink/10 py-8 px-4 group transition-colors hover:bg-ink/[0.02]"
                    >
                        <div className="md:col-span-2 w-24 shrink-0">
                            <div className="relative aspect-square overflow-hidden rounded-[2px] bg-gray-100">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                        alt={item.title}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-ink/30">No Img</div>
                                )}
                            </div>
                        </div>

                        {/* Details Column */}
                        <div className="md:col-span-5 flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                                <TransitionLink
                                    href={`/products/${item.slug}`}
                                    className="text-xl font-bold uppercase tracking-tight hover:underline underline-offset-4"
                                >
                                    {item.title}
                                </TransitionLink>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
                                <span className="whitespace-nowrap">Color: {item.color}</span>
                                <span className="opacity-30 hidden sm:inline">/</span>
                                <span className="whitespace-nowrap">Size: {item.size}</span>
                            </div>
                        </div>

                        {/* Quantity Column */}
                        <div className="md:col-span-3 flex items-center justify-between md:justify-center gap-6">
                            <div className="flex items-center border border-ink/15 rounded-none overflow-hidden bg-white">
                                <button
                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                    className="px-4 py-2 min-h-[44px] hover:bg-ink hover:text-bg-main transition-colors border-r border-ink/15 font-mono text-lg"
                                >
                                    −
                                </button>
                                <span className="px-6 py-2 font-mono text-lg font-medium tabular-nums">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                    className="px-4 py-2 min-h-[44px] hover:bg-ink hover:text-bg-main transition-colors border-l border-ink/15 font-mono text-lg"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={(e) => {
                                    const el = e.currentTarget.closest(".ledger-row");
                                    handleRemove(item._id, el);
                                }}
                                className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/30 hover:text-ink transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Total Column */}
                        <div className="md:col-span-2 text-right">
                            <strong className="font-mono text-xl font-medium tabular-nums">
                                {formatPrice(item.lineTotal)}
                            </strong>
                        </div>
                    </div>
                ))}
            </div>

            {/* Receipt Summary */}
            <div className="mt-24 flex justify-end">
                <div className="w-full max-w-md space-y-8">
                    <div className="border-t-2 border-ink pt-8 space-y-4">
                        <div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
                            <span>Subtotal</span>
                            <span className="text-ink font-medium tabular-nums">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-ink/10">
                            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink font-bold">
                                Total Amount
                            </span>
                            <span className="text-5xl font-black uppercase tracking-tighter tabular-nums">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 ">
                        <TransitionLink href="/checkout"
                            className="w-full py-6 px-2 text-sm tracking-[0.3em] bg-ink text-bg-main hover:bg-ink/90"
                        >
                            Checkout
                        </TransitionLink>
                        <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                            Secure encrypted checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}