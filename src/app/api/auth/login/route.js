import connectDB from "@/lib/db.js";
import User from "@/models/user.model.js";
import { Cart } from "@/models/cart.model.js";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ success: false, message: "User does not exist" }, { status: 404 });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
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
                if (!userCart) {
                    userCart = new Cart({ userId: user._id, items: [] });
                }

                for (const guestItem of guestCart.items) {
                    const existing = userCart.items.find(
                        (item) =>
                            item.variantId.toString() === guestItem.variantId.toString() &&
                            item.size === guestItem.size
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
            { success: true, data: loggedInUser, message: "Logged in successfully" },
            { status: 200 }
        );
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        });
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        });
        response.cookies.delete('guestCartId');
        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}