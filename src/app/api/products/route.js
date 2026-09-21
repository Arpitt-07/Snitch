// src/app/api/products/route.js
import connectDB from "@/lib/db.js";
import { Product } from "@/models/product.model.js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async (req) => {
    try {
        await connectDB();
        const searchParams = req.nextUrl.searchParams;
        const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
        const limit = Math.min(parseInt(searchParams.get("limit")) || 12, 50);
        const skip = (page - 1) * limit;

        const filter = { isPublished: true };

        const department = searchParams.get("department");
        if (department) {
            // Strict regex anchor: ^ means start, $ means end. 
            // It will ONLY match the exact word "Menswear", ignoring case.
            filter.department = { $regex: `^${department}$`, $options: "i" };
        }

        const category = searchParams.get("category");
        if (category) {
            filter.category = { $regex: `^${category}$`, $options: "i" };
        }

        const search = searchParams.get("search");
        if (search) filter.$text = {$search: search };

        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = Number(minPrice);
            if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
        }

        const sortParam = searchParams.get("sort");
        const sortMap = {
            newest: { createdAt: -1 },
            priceAsc: { basePrice: 1 },
            priceDesc: { basePrice: -1 },
        };
        const sort = sortMap[sortParam] || sortMap.newest;

        // DEBUG: Watch your server terminal to see exactly what MongoDB is querying
        console.log("MongoDB Filter Executing:", JSON.stringify(filter, null, 2));

        const [products, total] = await Promise.all([
            Product.find(filter)
                .select("-owner")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    products,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
                message: "Products fetched successfully"
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}