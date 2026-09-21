// src/app/api/cart/[itemId]/route.js
import connectDB from "@/lib/db.js";
import { Cart } from "@/models/cart.model.js";
import { Product } from "@/models/product.model.js";
import { resolveCartOwner, refreshGuestExpiry } from "@/lib/cartIdentity.js";
import { NextResponse } from "next/server";

function ownerFilter(owner) {
    return owner.type === "user" ? { userId: owner.userId } : { sessionId: owner.sessionId };
}

export const PATCH = async (req, { params }) => {
    try {
        await connectDB();
        const owner = await resolveCartOwner(req);
        const { itemId } = await params;
        const { quantity } = await req.json();

        if (!quantity || quantity < 1) {
            return NextResponse.json({ success: false, message: "Quantity must be at least 1" }, { status: 400 });
        }

        const cart = await Cart.findOne(ownerFilter(owner));
        if (!cart) return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });

        const item = cart.items.id(itemId);
        if (!item) return NextResponse.json({ success: false, message: "Item not found in cart" }, { status: 404 });

        const product = await Product.findById(item.productId);
        const variant = product?.variants.id(item.variantId);
        const sizeEntry = variant?.sizes.find((s) => s.size === item.size);

        if (!sizeEntry || sizeEntry.stock < quantity) {
            return NextResponse.json({ success: false, message: `Only ${sizeEntry?.stock || 0} left in stock` }, { status: 400 });
        }

        item.quantity = quantity;
        refreshGuestExpiry(cart, owner);
        await cart.save();

        return NextResponse.json({ success: true, data: { itemId, quantity }, message: "Cart updated" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const owner = await resolveCartOwner(req);
        const { itemId } = await params;

        const cart = await Cart.findOne(ownerFilter(owner));
        if (!cart) return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        refreshGuestExpiry(cart, owner);
        await cart.save();

        return NextResponse.json({ success: true, data: { itemId }, message: "Item removed from cart" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}