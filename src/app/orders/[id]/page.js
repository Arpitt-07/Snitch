"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import api from "@/lib/axios";

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        api.get(`/orders/${id}`)
            .then((res) => {
                setOrder(res.data.data);
                setStatus("idle");
            })
            .catch(() => setStatus("error"));
    }, [id]);

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

    if (status === "loading") return <p className="p-8">Loading order...</p>;
    if (status === "error" || !order) return <p className="p-8 text-red-600">Order not found.</p>;

    return (
        <div className="p-6 pt-32 max-w-2xl mx-auto">
            <div className="mb-12">
                <p className="text-xs font-mono uppercase tracking-widest text-green-600 mb-2">✓ Order confirmed</p>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="text-sm text-ink/50 font-medium">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-GB')} — status: <span className="text-ink font-bold uppercase">{order.status}</span>
                </p>
            </div>

            <div className="space-y-12">
                <div>
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 mb-6">Items</h2>
                    <div className="space-y-6">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                {item.image && (
                                    <img src={item.image} width={64} height={64} className="w-16 h-16 object-cover rounded-sm border border-ink/10" />
                                )}
                                <div className="flex-1 flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-bold uppercase tracking-tight text-sm">{item.title}</p>
                                        <p className="text-xs text-ink/50">{item.color} / {item.size} × {item.quantity}</p>
                                    </div>
                                    <p className="font-mono text-sm font-medium tabular-nums">{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-ink/10 pt-6 flex justify-between items-baseline font-bold uppercase tracking-tighter">
                    <span className="text-sm font-mono tracking-widest text-ink/40">Total Amount</span>
                    <span className="text-2xl">{formatPrice(order.total)}</span>
                </div>

                <div>
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 mb-4">Shipping to</h2>
                    <p className="text-sm leading-relaxed text-ink/70 font-medium">
                        {order.address.fullName}<br />
                        {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                        {order.address.city}, {order.address.state} {order.address.pincode}<br />
                        {order.address.phone}
                    </p>
                </div>
            </div>

            <TransitionLink href="/orders" className="inline-block mt-12 text-[11px] font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors border-b border-ink/10 pb-1">
                View all orders
            </TransitionLink>
        </div>
    );
}