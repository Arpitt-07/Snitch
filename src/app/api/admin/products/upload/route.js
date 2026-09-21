import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import { verifyJWT } from "@/lib/verifyJWT.js";
import { uploadImage } from "@/lib/imagekit.js";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req) => {
    const user = await verifyJWT(req);

    if (user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to perform this action");
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
        throw new ApiError(400, "No image file provided");
    }

    const { url, fileId } = await uploadImage(file);

    return NextResponse.json(
        new ApiResponse(200, { url, fileId }, "Image uploaded successfully"),
        { status: 200 }
    );
});