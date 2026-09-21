"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import ProductCard from "@/components/ui/ProductCard";

function ProductsCatalogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const department = searchParams.get("department") || "";
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page")) || 1;

    // 1. Optimized query string builder (Memoized)
    const createQueryString = useCallback((name, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        // Reset to page 1 if we are changing a filter (not paginating)
        if (name !== "page") {
            params.delete("page");
        }

        return params.toString();
    }, [searchParams]);

    // 2. Added AbortController to prevent race conditions and cancel pending requests
    const fetchProducts = useCallback(async (abortSignal) => {
        setStatus("loading");
        setError("");
        try {
            const params = { page, limit: 12, sort };
            if (department) params.department = department;
            if (search) params.search = search;

            const res = await api.get("/products", {
                params,
                signal: abortSignal // Pass signal to Axios
            });

            setProducts(res.data.data.products);
            setPagination(res.data.data.pagination);
            setStatus("idle");
        } catch (err) {
            // Ignore errors caused by the request being intentionally aborted
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;

            setError(err.response?.data?.message || "Failed to load products");
            setStatus("error");
        }
    }, [department, sort, search, page]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProducts(controller.signal);

        // Cleanup: abort previous request if filters change before it finishes
        return () => controller.abort();
    }, [fetchProducts]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.push(`/products?${createQueryString("search", formData.get("search"))}`);
    };

    return (
        <div className="min-h-screen bg-bg-main text-ink px-6 pt-32 pb-12 md:px-16">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/40">
                        The Collection
                    </p>
                    <h1 className="mt-3 text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9]">
                        Shop <br /> All
                    </h1>
                </header>

                <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-8 border-b border-ink/10 mb-12">
                    <form onSubmit={handleSearchSubmit} className="flex-1 space-y-1">
                        <label htmlFor="searchInput" className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 block">Search</label>
                        <input
                            id="searchInput"
                            name="search"
                            className="w-full bg-transparent border-b border-ink/20 py-2 outline-none focus:border-ink transition-colors text-sm"
                            placeholder="Keyword..."
                            defaultValue={search}
                        />
                    </form>

                    <div className="w-full md:w-48 space-y-1">
                        <label className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 block">Department</label>
                        <select
                            className="w-full bg-transparent border-b border-ink/20 py-2 outline-none focus:border-ink transition-colors text-sm"
                            value={department}
                            onChange={(e) => router.push(`/products?${createQueryString("department", e.target.value)}`)}
                        >
                            <option value="">All Departments</option>
                            <option value="Menswear">Menswear</option>
                            <option value="Womenswear">Womenswear</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48 space-y-1">
                        <label className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/40 block">Sort</label>
                        <select
                            className="w-full bg-transparent border-b border-ink/20 py-2 outline-none focus:border-ink transition-colors text-sm"
                            value={sort}
                            onChange={(e) => router.push(`/products?${createQueryString("sort", e.target.value)}`)}
                        >
                            <option value="newest">Newest</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                {status === "loading" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-[2px] border border-ink/5" />
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <div className="p-6 border border-ink/30 bg-ink/10 text-ink text-sm">
                        {error}
                    </div>
                )}

                {status === "idle" && products.length === 0 && (
                    <div className="py-24 text-center border border-dashed border-ink/20 rounded-[2px]">
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink/50">
                            {department
                                ? `No products currently available in ${department}.`
                                : "No items match current search."}
                        </p>
                    </div>
                )}

                {status === "idle" && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((product) => (
                            <div key={product._id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex flex-col items-center justify-center mt-24 gap-6">
                        <div className="flex items-center gap-0 border border-ink/20 rounded-[3px] overflow-hidden">
                            <button
                                disabled={page <= 1}
                                onClick={() => router.push(`/products?${createQueryString("page", page - 1)}`)}
                                className="px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] border-r border-ink/10 hover:bg-ink hover:text-bg-main transition-all disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <div className="px-8 py-3 font-mono text-[11px] uppercase tracking-[0.18em] flex items-center bg-ink text-white">
                                {String(pagination.page).padStart(2, "0")} / {String(pagination.totalPages).padStart(2, "0")}
                            </div>
                            <button
                                disabled={page >= pagination.totalPages}
                                onClick={() => router.push(`/products?${createQueryString("page", page + 1)}`)}
                                className="px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-ink hover:text-bg-main transition-all disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsCatalogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono uppercase text-xs">Loading catalog...</div>}>
            <ProductsCatalogContent />
        </Suspense>
    );
}