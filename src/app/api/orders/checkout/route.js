import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Cart } from "@/models/cart.model.js";
import { buildCartResponse } from "@/lib/cartPricing.js";
import { razorpay } from "@/lib/razorpay.js";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
    await connectDB();
    const user = await verifyJWT(req);

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty");
    }

    const owner = { type: "user", userId: user._id };
    const { items, total } = await buildCartResponse(cart, owner);

    if (items.length === 0) {
        throw new ApiError(400, "No items in your cart are currently available");
    }
    if (total <= 0) {
        throw new ApiError(400, "Invalid order total");
    }

    const razorpayOrder = await razorpay.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: `receipt_${user._id}_${Date.now()}`,
    });

    return NextResponse.json(
        new ApiResponse(200, {
            razorpayOrderId: razorpayOrder.id,
            amount: total * 100,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        }, "Razorpay order created"),
        { status: 200 }
    );
});