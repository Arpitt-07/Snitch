"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import ImageUploader from "@/components/ImageUploader";

const inputClass =
    "w-full border border-ink/15 bg-white/50 px-4 py-3 text-xl text-ink outline-none focus:border-ink transition-colors rounded-[3px]";
const labelClass =
    "font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 block mb-2";
const btnGhost =
    "px-6 py-2.5 border border-ink/20 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-ink/60 hover:bg-ink hover:text-bg-main transition-all rounded-[3px]";

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState(null);
    const [variants, setVariants] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/admin/products`).then((res) => {
            const found = res.data.data.products.find((p) => p._id === id);
            if (found) {
                setForm({
                    ...found,
                    tags: found.tags?.join(", ") || "",
                });
                setVariants(found.variants || []);
            }
        });
    }, [id]);

    const updateVariant = (i, field, value) => {
        setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
    };
    const updateSize = (vi, si, field, value) => {
        setVariants((prev) => {
            const next = [...prev]; 
            const variant = { ...next[vi] }; 
            const sizes = [...(variant.sizes || [])]; 
            let finalValue = value;
            if (field === "stock" || field === "priceOverride") {
                finalValue = value === "" ? "" : Number(value);
            }
            
            sizes[si] = { ...sizes[si], [field]: finalValue }; 
            variant.sizes = sizes;
            next[vi] = variant;
            
            return next;
        });
    };

    const addVariant = () => setVariants((prev) => [...prev, {
        color: "",
        colorCode: "",
        images: [],
        sizes: [{ size: "", stock: 0, priceOverride: "" }]
    }]);
    const addSize = (vi) => {
        setVariants((prev) => {
            const next = [...prev];
            const variant = { ...next[vi] };
            const sizes = [...(variant.sizes || [])];
            
            sizes.push({ size: "", stock: 0, priceOverride: "" });
            
            variant.sizes = sizes;
            next[vi] = variant;
            return next;
        });
    };

    // Deep clone for removing sizes safely
    const removeSize = (vi, si) => {
        setVariants((prev) => {
            const next = [...prev];
            const variant = { ...next[vi] };
            const sizes = [...(variant.sizes || [])];
            
            sizes.splice(si, 1); // Remove the size at index
            
            variant.sizes = sizes;
            next[vi] = variant;
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await api.patch(`/admin/products/${id}`, {
                title: form.title,
                description: form.description,
                basePrice: Number(form.basePrice),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
                department: form.department,
                category: form.category,
                tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
                isPublished: form.isPublished,
                variants: variants,
            });
            router.push("/admin");
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        }
    };

    if (!form) return (
        <div className="min-h-screen flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
            Loading item...
        </div>
    );

    return (
        <div className="min-h-screen px-6 py-12 md:px-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 border-b border-ink/10 pb-8">
                    <p className={labelClass}>Inventory</p>
                    <h1 className="mt-3 text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                        Edit Item
                    </h1>
                </header>

                {error && (
                    <div className="mb-8 p-4 border border-ink/30 bg-ink/10 text-ink text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-ink/10 pt-8">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className={labelClass}>Title</label>
                                <input
                                    className="w-full text-2xl font-semibold uppercase tracking-tight border-b border-ink/20 py-2 outline-none focus:border-ink transition-colors"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Description</label>
                                <textarea
                                    className={`${inputClass} h-32`}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Base Price (₹)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={form.basePrice}
                                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Discount Price (Optional)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={form.discountPrice || ""}
                                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={labelClass}>Department</label>
                                    <select
                                        className={inputClass}
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    >
                                        <option>Menswear</option>
                                        <option>Womenswear</option>
                                        <option>Accessories</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Category</label>
                                    <input
                                        className={inputClass}
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags and Publishing */}
                    <div className="flex flex-col md:flex-row gap-8 border-t border-ink/10 pt-8">
                        <div className="flex-1 space-y-2">
                            <label className={labelClass}>Search Tags (Comma Separated)</label>
                            <input
                                className={inputClass}
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-4 border border-ink/15 rounded-[3px] p-4">
                            <input
                                type="checkbox"
                                id="isPublished"
                                className="w-5 h-5 accent-ink cursor-pointer"
                                checked={form.isPublished}
                                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                            />
                            <label htmlFor="isPublished" className={labelClass.replace("block mb-2", "cursor-pointer mb-0")}>
                                Set as Published
                            </label>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="space-y-8 border-t border-ink/10 pt-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Variants</h2>
                            <button type="button" onClick={addVariant} className={btnGhost}>
                                + Add Variant
                            </button>
                        </div>

                        <div className="space-y-12">
                            {variants.map((v, vi) => (
                                <div key={vi} className="p-6 border border-ink/10 rounded-[3px] relative space-y-8">
                                    <div className="absolute -top-3 left-4 bg-bg-main px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                                        Variant 0{vi + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className={labelClass}>Color Name</label>
                                                    <input
                                                        className={inputClass}
                                                        value={v.color}
                                                        onChange={(e) => updateVariant(vi, "color", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className={labelClass}>Hex Code</label>
                                                    <input
                                                        className={inputClass}
                                                        value={v.colorCode !== undefined && v.colorCode !== null ? v.colorCode : ""}
                                                        onChange={(e) => updateVariant(vi, "colorCode", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className={labelClass}>Images</label>
                                                <ImageUploader
                                                    images={v.images}
                                                    onChange={(imgs) => updateVariant(vi, "images", imgs)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className={labelClass}>Size Grid</label>
                                                
                                                {/* FIXED: Explicitly defined classes instead of using .replace to prevent CSS conflicts */}
                                                <button
                                                    type="button"
                                                    onClick={() => addSize(vi)}
                                                    className="border border-ink/20 px-4 py-1.5 rounded-[3px] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-ink hover:text-bg-main transition-colors cursor-pointer"
                                                >
                                                    + Add Size
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                {(v.sizes || []).map((s, si) => (
                                                    <div key={`variant-${vi}-size-${si}`} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                                        
                                                        {/* FIXED: Added min-w-0 so inputs don't overflow the flex container making them unclickable */}
                                                        <input
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.size !== undefined ? s.size : ""}
                                                            onChange={(e) => updateSize(vi, si, "size", e.target.value)}
                                                            placeholder="S/M/L"
                                                        />
                                                        <input
                                                            type="number"
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.stock !== undefined ? s.stock : ""}
                                                            onChange={(e) => updateSize(vi, si, "stock", e.target.value)}
                                                            placeholder="Stock"
                                                        />
                                                        <input
                                                            type="number"
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.priceOverride !== undefined && s.priceOverride !== null ? s.priceOverride : ""}
                                                            onChange={(e) => updateSize(vi, si, "priceOverride", e.target.value)}
                                                            placeholder="Price Override"
                                                        />
                                                        
                                                        {/* FIXED: Explicit button classes to prevent padding overlays blocking clicks */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSize(vi, si)}
                                                            className="w-[46px] h-[46px] flex-shrink-0 border border-ink/15 bg-white/50 rounded-[3px] text-ink/40 hover:text-ink hover:border-ink/60 transition-colors flex items-center justify-center text-xl cursor-pointer"
                                                            title="Remove Size"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-12 flex justify-end">
                        <button
                            type="submit"
                            className="px-10 py-4 bg-ink text-bg-main text-[11px] font-bold uppercase tracking-[0.24em] rounded-[3px] hover:bg-ink/90 active:scale-[0.97] transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}