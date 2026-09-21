"use client";
import { useEffect, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import api from "@/lib/axios";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        api.get("/orders")
            .then((res) => {
                setOrders(res.data.data);
                setStatus("idle");
            })
            .catch(() => setStatus("error"));
    }, []);

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

    if (status === "loading") return <p className="p-8">Loading orders...</p>;
    if (status === "error") return <p className="p-8 text-red-600">Failed to load orders.</p>;

    if (orders.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">My Orders</h1>
                <p>You haven't placed any orders yet.</p>
                <TransitionLink href="/products" className="underline">Start shopping</TransitionLink>
            </div>
        );
    }

    return (
        <div className="p-6 pt-32 max-w-3xl mx-auto"  style={{ paddingTop: "var(--nav-height)" }}>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-12">My Orders</h1>
            <div className="space-y-4">
                {orders.map((order) => (
                    <TransitionLink
                        key={order._id}
                        href={`/orders/${order._id}`}
                        className="block border border-ink/10 p-6 hover:border-ink transition-colors group"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="space-y-1">
                                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </p>
                                <p className="text-sm text-ink/60 font-medium">
                                    {new Date(order.createdAt).toLocaleDateString('en-GB')} — {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-4 sm:gap-1">
                                <p className="font-mono text-lg font-bold tabular-nums">{formatPrice(order.total)}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-ink text-bg-main rounded-full">
                                    {order.status}
                                </p>
                            </div>
                        </div>
                    </TransitionLink>
                ))}
            </div>
        </div>
    );
}