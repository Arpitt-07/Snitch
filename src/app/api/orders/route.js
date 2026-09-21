// src/app/api/orders/route.js
import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Order } from "@/models/order.model.js";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
    await connectDB();
    const user = await verifyJWT(req);

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json(new ApiResponse(200, orders, "Orders fetched"), { status: 200 });
});