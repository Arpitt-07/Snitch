// src/app/api/orders/[id]/route.js
import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { Order } from "@/models/order.model.js";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req, { params }) => {
    await connectDB();
    const user = await verifyJWT(req);
    const { id } = params;

    const order = await Order.findOne({ _id: id, userId: user._id });
    if (!order) throw new ApiError(404, "Order not found");

    return NextResponse.json(new ApiResponse(200, order, "Order fetched"), { status: 200 });
});