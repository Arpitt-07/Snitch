// src/app/api/auth/register/route.js
import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import User from "@/models/user.model.js";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const newUser = await User.create({ username, email, password });

    return NextResponse.json(
        new ApiResponse(
            201,
            { id: newUser._id, username: newUser.username, email: newUser.email },
            "User registered successfully"
        ),
        { status: 201 }
    );
});