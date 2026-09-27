import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "@/lib/asyncHandler.js";
import connectDB from "@/lib/db.js";
import { ApiResponse } from "@/lib/ApiResponse.js";
import { ApiError } from "@/lib/ApiError.js";
import User from "@/models/user.model.js";
import { Cart } from "@/models/cart.model.js";
import { NextResponse } from "next/server";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const POST = asyncHandler(async (req) => {
    await connectDB();
    const { credential } = await req.json();

    if (!credential) {
        throw new ApiError(400, "Missing Google credential");
    }

    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        throw new ApiError(401, "Invalid Google credential");
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
        throw new ApiError(401, "Google account email is not verified");
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
        const baseUsername = email.split("@")[0];
        let username = baseUsername;
        let suffix = 0;
        while (await User.findOne({ username })) {
            suffix += 1;
            username = `${baseUsername}${suffix}`;
        }

        user = await User.create({
            username,
            email,
            googleId,
            authProvider: "google",
            avatar: picture,
        });
    } else if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        await user.save({ validateBeforeSave: false });
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const guestSessionId = req.cookies.get("guestCartId")?.value;
    if (guestSessionId) {
        const guestCart = await Cart.findOne({ sessionId: guestSessionId });
        if (guestCart && guestCart.items.length > 0) {
            let userCart = await Cart.findOne({ userId: user._id });
            if (!userCart) userCart = new Cart({ userId: user._id, items: [] });

            for (const guestItem of guestCart.items) {
                const existing = userCart.items.find(
                    (item) => item.variantId.toString() === guestItem.variantId.toString() && item.size === guestItem.size
                );
                if (existing) {
                    existing.quantity += guestItem.quantity;
                } else {
                    userCart.items.push({
                        productId: guestItem.productId,
                        variantId: guestItem.variantId,
                        size: guestItem.size,
                        quantity: guestItem.quantity,
                    });
                }
            }
            await userCart.save();
        }
        await Cart.deleteOne({ sessionId: guestSessionId });
    }

    const response = NextResponse.json(
        new ApiResponse(200, loggedInUser, "Logged in with Google"),
        { status: 200 }
    );
    response.cookies.set('accessToken', accessToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'strict', maxAge: 60 * 60 * 24,
    });
    response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'strict', maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete('guestCartId');
    return response;
});