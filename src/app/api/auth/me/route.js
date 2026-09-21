// src/app/api/auth/me/route.js
import { asyncHandler } from "@/lib/asyncHandler.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { verifyJWT } from "@/lib/verifyJWT.js";

export const GET = asyncHandler(async (req) => {
    const user = await verifyJWT(req);
    return Response.json(new ApiResponse(200, user, "User fetched successfully"));
})