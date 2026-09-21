import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import User from "@/models/user.model.js";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = asyncHandler(async (req) => {
    await connectDB();

    const incomingRefreshToken = req.cookies.get("refreshToken")?.value;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // this is the critical check — confirms this exact token wasn't already
    // logged-out/rotated/revoked, since a valid JWT signature alone isn't enough
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or has been used");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken; // rotation: old one is now dead
    await user.save({ validateBeforeSave: false });

    const response = NextResponse.json(
        new ApiResponse(200, {}, "Access token refreshed"),
        { status: 200 }
    );

    response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
    });
    response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
});