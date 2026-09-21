// src/components/ImageUploader.jsx
"use client";
import { useState, useRef } from "react";
import api from "@/lib/axios";

export default function ImageUploader({ images, onChange }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError("");

        try {
            const uploaded = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append("image", file);

                const res = await api.post("/admin/products/upload", formData);
                uploaded.push({ url: res.data.data.url, fileId: res.data.data.fileId });
            }
            onChange([...images, ...uploaded]);
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const removeImage = (fileId) => {
        onChange(images.filter((img) => img.fileId !== fileId));
    };

    const handleDragStart = (index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        const from = dragItem.current;
        const to = dragOverItem.current;

        if (from === null || to === null || from === to) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const reordered = [...images];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        dragItem.current = null;
        dragOverItem.current = null;
        onChange(reordered);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFiles}
                    disabled={uploading}
                    className="block w-full text-xs font-mono uppercase tracking-widest file:mr-4 file:py-2 file:px-4 file:border file:border-ink/20 file:rounded-[3px] file:text-[11px] file:uppercase file:font-bold hover:file:bg-ink hover:file:text-bg-main transition-all cursor-pointer"
                />
            </div>
            {uploading && <p className="text-xs font-mono uppercase tracking-widest text-ink/50">Uploading...</p>}
            {error && <p className="text-xs font-mono uppercase tracking-widest text-ink">{error}</p>}
            {images.length > 1 && <p className="text-[10px] font-mono uppercase tracking-widest text-ink/40">Drag to reorder. First image is the cover.</p>}

            <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, index) => (
                    <div
                        key={img.fileId}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`relative cursor-grab w-16 h-16 sm:w-20 sm:h-20 border ${index === 0 ? 'border-ink' : 'border-ink/15'}`}
                    >
                        <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover pointer-events-none"
                        />
                        {index === 0 && (
                            <span className="absolute bottom-0 left-0 text-[8px] uppercase font-bold bg-ink text-white px-1 leading-none">
                                cover
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => removeImage(img.fileId)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-bg-main border border-ink/20 text-ink text-xs flex items-center justify-center hover:bg-ink hover:text-bg-main transition-colors"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
