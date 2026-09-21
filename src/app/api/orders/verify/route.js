import crypto from "crypto";
import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Cart } from "@/models/cart.model.js";
import { Product } from "@/models/product.model.js";
import { Order } from "@/models/order.model.js";
import { buildCartResponse } from "@/lib/cartPricing.js";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
    await connectDB();
    const user = await verifyJWT(req);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, address } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Missing payment verification data");
    }
    if (!address?.fullName || !address?.phone || !address?.line1 || !address?.city || !address?.state || !address?.pincode) {
        throw new ApiError(400, "Complete shipping address is required");
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, "Payment verification failed");
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty — cannot create order");
    }

    const owner = { type: "user", userId: user._id };
    const { items } = await buildCartResponse(cart, owner);

    if (items.length === 0) {
        throw new ApiError(400, "No items in your cart are currently available");
    }
    const orderItems = [];
    let total = 0;
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new ApiError(400, `${item.title} is no longer available`);

        const variant = product.variants.id(item.variantId);
        const sizeEntry = variant?.sizes.find((s) => s.size === item.size);

        if (!sizeEntry || sizeEntry.stock < item.quantity) {
            throw new ApiError(400, `${item.title} (${item.size}) no longer has enough stock`);
        }

        sizeEntry.stock -= item.quantity;
        await product.save();

        total += item.lineTotal;
        orderItems.push({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            priceAtPurchase: item.unitPrice,
        });
    }

    const order = await Order.create({
        userId: user._id,
        items: orderItems,
        total,
        address,
        status: "paid",
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
    });

    cart.items = [];
    await cart.save();

    return NextResponse.json(new ApiResponse(201, order, "Order placed successfully"), { status: 201 });
});