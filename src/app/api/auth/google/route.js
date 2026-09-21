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
    console.log("DEBUG: Google Auth attempt started");
    await connectDB();

    let body;
    try {
        body = await req.json();
        console.log("DEBUG: Request body parsed successfully");
    } catch (e) {
        console.error("DEBUG: Failed to parse request body:", e);
        throw new ApiError(400, "Invalid request body");
    }

    const { credential } = body;
    console.log("DEBUG: Credential present:", !!credential);

    if (!credential) {
        throw new ApiError(400, "Missing Google credential");
    }

    let payload;
    try {
        console.log("DEBUG: Verifying token with Google...");
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
        console.log("DEBUG: Google token verified for:", payload.email);
    } catch (e) {
        console.error("DEBUG: Google token verification failed:", e);
        throw new ApiError(401, "Invalid Google credential");
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
        throw new ApiError(401, "Google account email is not verified");
    }

    console.log("DEBUG: Searching for user:", email);
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    console.log("DEBUG: User found:", !!user);

    if (!user) {
        console.log("DEBUG: Creating new user...");
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
        console.log("DEBUG: New user created:", user._id);
    } else if (!user.googleId) {
        console.log("DEBUG: Linking existing account to Google...");
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        await user.save({ validateBeforeSave: false });
    }

    try {
        console.log("DEBUG: Generating tokens...");
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        console.log("DEBUG: Tokens generated and user saved");

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const guestSessionId = req.cookies.get("guestCartId")?.value;
        if (guestSessionId) {
            console.log("DEBUG: Migrating guest cart:", guestSessionId);
            try {
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
                    console.log("DEBUG: Guest cart merged");
                }
                await Cart.deleteOne({ sessionId: guestSessionId });
            } catch (cartError) {
                console.error("DEBUG: Guest cart migration failed, but allowing login:", cartError);
            }
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
    } catch (e) {
        console.error("DEBUG: Critical error during token generation or cart migration:", e);
        throw e;
    }
});