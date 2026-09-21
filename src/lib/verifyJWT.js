
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db.js";
import { ApiError } from "@/lib/ApiError.js";
import User from "@/models/user.model.js";

export async function verifyJWT(req) {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "User no longer exists");
    }

    return user;
}