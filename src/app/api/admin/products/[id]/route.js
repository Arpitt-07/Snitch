import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Product } from "@/models/product.model.js";
import { deleteImageFromImageKit } from "@/lib/imagekit.js";
import { NextResponse } from "next/server";

const ALLOWED_FIELDS = [
    "title",
    "description",
    "basePrice",
    "discountPrice",
    "department",
    "category",
    "tags",
    "variants",
    "isPublished",
    "isFeatured",
];

export const PATCH = asyncHandler(async (req, { params }) => {
    await connectDB();

    const user = await verifyJWT(req);
    if (user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const { id } = await params;
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            product[field] = body[field];
        }
    }

    try {
        await product.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, `Product with this ${Object.keys(error.keyValue)[0]} already exists`);
        }
        if (error.name === "ValidationError") {
            throw new ApiError(400, error.message);
        }
        throw error;
    }

    return NextResponse.json(
        new ApiResponse(200, product, "Product updated successfully"),
        { status: 200 }
    );
});

export const DELETE = asyncHandler(async (req, { params }) => {
    await connectDB();

    const user = await verifyJWT(req);
    if (user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const { id } = params;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const deletionResults = await Promise.allSettled(
        product.variants.flatMap((variant) =>
            variant.images.map((image) => {
                const fileId = typeof image === "string" ? null : image.fileId;
                return fileId ? deleteImageFromImageKit(fileId) : Promise.resolve();
            })
        )
    );

    const failedDeletions = deletionResults.filter((r) => r.status === "rejected");
    if (failedDeletions.length > 0) {
        console.error(`${failedDeletions.length} image(s) failed to delete from ImageKit for product ${id}`);
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json(
        new ApiResponse(200, {}, "Product deleted successfully"),
        { status: 200 }
    );
});