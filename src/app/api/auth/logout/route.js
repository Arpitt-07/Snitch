import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import User from "@/models/user.model.js";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = asyncHandler(async (req) => {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }

    await User.findByIdAndUpdate(
        decoded._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const response = NextResponse.json(
        new ApiResponse(200, {}, "Logged out successfully"),
        { status: 200 }
    );

    response.cookies.set('accessToken', "", { maxAge: 0 });
    response.cookies.set('refreshToken', "", { maxAge: 0 });

    return response;
})