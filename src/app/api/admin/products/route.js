import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Product } from "@/models/product.model.js";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
    await connectDB();

    const user = await verifyJWT(req);
    if (user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const body = await req.json();
    const {
        title,
        description,
        basePrice,
        discountPrice,
        department,
        category,
        tags,
        variants,
        isPublished,
        isFeatured,
    } = body;

    if (!title || !description || !basePrice || !department || !category) {
        throw new ApiError(400, "Title, description, basePrice, department and category are required");
    }

    if (!Array.isArray(variants) || variants.length === 0) {
        throw new ApiError(400, "At least one variant is required");
    }

    try {
        const product = await Product.create({
            title,
            description,
            basePrice,
            discountPrice,
            department,
            category,
            tags,
            variants,
            isPublished,
            isFeatured,
            owner: user._id,
        });

        return NextResponse.json(
            new ApiResponse(201, product, "Product created successfully"),
            { status: 201 }
        );
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, `Product with this ${Object.keys(error.keyValue)[0]} already exists`);
        }
        if (error.name === "ValidationError") {
            throw new ApiError(400, error.message);
        }
        throw error;
    }
});

export const GET = asyncHandler(async (req) => {
    await connectDB();

    const user = await verifyJWT(req);
    if (user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { owner: user._id };

    const department = searchParams.get("department");
    if (department) filter.department = department;

    const isPublished = searchParams.get("isPublished");
    if (isPublished !== null && isPublished !== "") {
        filter.isPublished = isPublished === "true";
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(filter),
    ]);

    return NextResponse.json(
        new ApiResponse(200, {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, "Products fetched successfully"),
        { status: 200 }
    );
});