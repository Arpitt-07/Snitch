"use client";
import { useEffect, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";

const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = () => {
        setLoading(true);
        api.get("/admin/products")
            .then((res) => {
                setProducts(res.data.data.products);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to load products");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    return (
        <div className="min-h-screen px-6 py-12 md:px-20">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-ink/10 pb-8">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                            Admin
                        </p>
                        <h1 className="mt-3 text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                            Inventory
                        </h1>
                    </div>
                    <Button href="/admin/products/new" variant="primary">
                        Create New Item
                    </Button>
                </header>

                {error && (
                    <div className="mb-8 p-4 border border-ink/30 bg-ink/10 text-ink text-xs">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border-t border-ink/10">
                        <thead>
                            <tr className="border-b border-ink/10 text-[11px] uppercase tracking-[0.2em] text-ink/40">
                                <th className="py-4 px-4 font-semibold">Title</th>
                                <th className="py-4 px-4 font-semibold">Dept</th>
                                <th className="py-4 px-4 font-semibold">Price</th>
                                <th className="py-4 px-4 font-semibold">Status</th>
                                <th className="py-4 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-4"><div className="h-4 w-48 bg-ink/5" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-32 bg-ink/5" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-16 bg-ink/5" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-20 bg-ink/5" /></td>
                                        <td className="py-4 px-4 text-right"><div className="h-4 w-20 ml-auto bg-ink/5" /></td>
                                    </tr>
                                ))
                            ) : (
                                products.map((p) => (
                                    <tr key={p._id} className="group transition-colors hover:bg-ink/[0.03]">
                                        <td className="py-4 px-4 font-semibold uppercase tracking-tighter">{p.title}</td>
                                        <td className="py-4 px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">{p.department}</td>
                                        <td className="py-4 px-4 font-mono">{formatPrice(p.basePrice)}</td>
                                        <td className="py-4 px-4">
                                            <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 ${
                                                p.isPublished
                                                    ? 'bg-ink text-white'
                                                    : 'bg-ink/5 text-ink/50 border border-ink/10'
                                            }`}>
                                                {p.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-6">
                                                <TransitionLink
                                                    href={`/admin/products/${p._id}/edit`}
                                                    className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink/60 hover:text-ink transition-colors"
                                                >
                                                    Edit
                                                </TransitionLink>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="text-[11px] uppercase tracking-[0.2em] font-bold text-ink/40 hover:text-ink transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}