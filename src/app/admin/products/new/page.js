"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ImageUploader from "@/components/ImageUploader";

const inputClass =
    "w-full border border-ink/15 bg-white/50 px-4 py-3 text-sm text-ink outline-none focus:border-ink transition-colors rounded-[3px]";
const labelClass =
    "font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 block mb-2";
const btnGhost =
    "px-6 py-2.5 border border-ink/20 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-ink/60 hover:bg-ink hover:text-bg-main transition-all rounded-[3px]";

export default function NewProductPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "", description: "", basePrice: "", discountPrice: "",
        department: "Menswear", category: "", tags: "", isPublished: false,
    });
    const [variants, setVariants] = useState([{
        color: "",
        colorCode: "",
        images: [],
        sizes: [{ size: "", stock: 0, priceOverride: "" }]
    }]);

    const updateVariant = (i, field, value) => {
        setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
    };

    const updateSize = (vi, si, field, value) => {
        setVariants((prev) => prev.map((v, idx) => {
            if (idx !== vi) return v;
            const sizes = v.sizes.map((s, sidx) => sidx === si ? { ...s, [field]: value } : s);
            return { ...v, sizes };
        }));
    };

    const addVariant = () => setVariants((prev) => [...prev, {
        color: "",
        colorCode: "",
        images: [],
        sizes: [{ size: "", stock: 0, priceOverride: "" }]
    }]);
    const addSize = (vi) => setVariants((prev) => prev.map((v, idx) =>
        idx === vi ? { ...v, sizes: [...v.sizes, { size: "", stock: 0, priceOverride: "" }] } : v
    ));

    const removeVariant = (vi) => setVariants((prev) => prev.filter((_, idx) => idx !== vi));

    const removeSize = (vi, si) => setVariants((prev) => prev.map((v, idx) =>
        idx === vi ? { ...v, sizes: v.sizes.filter((_, sidx) => sidx !== si) } : v
    ));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const payload = {
                ...form,
                basePrice: Number(form.basePrice),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
                tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
                variants: variants.map((v) => ({
                    color: v.color,
                    colorCode: v.colorCode || undefined,
                    images: v.images,
                    sizes: v.sizes.map((s) => ({
                        size: s.size,
                        stock: Number(s.stock),
                        priceOverride: s.priceOverride ? Number(s.priceOverride) : null,
                    })),
                })),
            };
            await api.post("/admin/products", payload);
            router.push("/admin");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create product");
        }
    };

    return (
        <div className="min-h-screen px-6 py-12 md:px-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 border-b border-ink/10 pb-8">
                    <p className={labelClass}>Inventory</p>
                    <h1 className="mt-3 text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                        New Item
                    </h1>
                </header>

                {error && (
                    <div className="mb-8 p-4 border border-ink/30 bg-ink/10 text-ink text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-ink/10 pt-8">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className={labelClass}>Title</label>
                                <input
                                    className="w-full text-2xl font-semibold uppercase tracking-tight border-b border-ink/20 py-2 outline-none focus:border-ink transition-colors"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Sartorial Silence..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Description</label>
                                <textarea
                                    className={`${inputClass} h-32`}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the piece..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Base Price (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputClass}
                                    value={form.basePrice}
                                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Discount Price (Optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputClass}
                                    value={form.discountPrice}
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
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(vi)}
                                        className="absolute -top-5 right-4 text-ink/30 hover:text-ink transition-colors text-xs"
                                        title="Remove Variant"
                                    >
                                        Remove
                                    </button>

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
                                                        value={v.colorCode}
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
                                                <button
                                                    type="button"
                                                    onClick={() => addSize(vi)}
                                                    className="text-[11px] font-mono uppercase tracking-[0.18em] border border-ink/20 px-2 py-1 rounded-[2px] hover:border-ink/60 transition-colors"
                                                >
                                                    + Add Size
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {v.sizes.map((s, si) => (
                                                    <div key={`variant-${vi}-size-${si}`} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                                        <input
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.size}
                                                            onChange={(e) => updateSize(vi, si, "size", e.target.value)}
                                                            placeholder="S/M/L"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.stock}
                                                            onChange={(e) => updateSize(vi, si, "stock", e.target.value)}
                                                            placeholder="Stock"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className={`${inputClass} flex-1 min-w-0`}
                                                            value={s.priceOverride ?? ""}
                                                            onChange={(e) => updateSize(vi, si, "priceOverride", e.target.value)}
                                                            placeholder="Price Override"
                                                        />
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
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}