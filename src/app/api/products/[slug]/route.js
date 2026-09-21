// src/app/api/products/[slug]/route.js
import connectDB from "@/lib/db.js";
import { Product } from "@/models/product.model.js";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await connectDB();

        const { slug } = await params;

        const product = await Product.findOne({ slug, isPublished: true }).select("-owner");

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, data: product, message: "Product fetched successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}