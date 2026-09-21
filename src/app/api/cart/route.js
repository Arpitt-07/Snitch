// src/app/api/cart/route.js
import connectDB from "@/lib/db.js";
import { Cart } from "@/models/cart.model.js";
import { Product } from "@/models/product.model.js";
import { resolveCartOwner, attachGuestCookie, refreshGuestExpiry } from "@/lib/cartIdentity.js";
import { NextResponse } from "next/server";
import { buildCartResponse } from "@/lib/cartPricing.js";

function ownerFilter(owner) {
    return owner.type === "user" ? { userId: owner.userId } : { sessionId: owner.sessionId };
}

export const GET = async (req) => {
    try {
        await connectDB();
        const owner = await resolveCartOwner(req);

        const cart = await Cart.findOne(ownerFilter(owner));
        const data = await buildCartResponse(cart, owner);

        const response = NextResponse.json({ success: true, data, message: "Cart fetched" }, { status: 200 });
        return attachGuestCookie(response, owner);
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export const POST = async (req) => {
    try {
        await connectDB();
        const owner = await resolveCartOwner(req);

        const { productId, variantId, size, quantity = 1 } = await req.json();

        if (!productId || !variantId || !size) {
            return NextResponse.json({ success: false, message: "productId, variantId and size are required" }, { status: 400 });
        }
        if (quantity < 1) {
            return NextResponse.json({ success: false, message: "Quantity must be at least 1" }, { status: 400 });
        }

        const product = await Product.findOne({ _id: productId, isPublished: true });
        if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

        const variant = product.variants.id(variantId);
        if (!variant) return NextResponse.json({ success: false, message: "Variant not found" }, { status: 404 });

        const sizeEntry = variant.sizes.find((s) => s.size === size.toUpperCase());
        if (!sizeEntry) return NextResponse.json({ success: false, message: "Size not available for this variant" }, { status: 404 });

        let cart = await Cart.findOne(ownerFilter(owner));
        if (!cart) {
            cart = new Cart({ ...ownerFilter(owner), items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.variantId.toString() === variantId && item.size === size.toUpperCase()
        );

        const requestedTotal = (existingItem?.quantity || 0) + quantity;
        if (sizeEntry.stock < requestedTotal) {
            return NextResponse.json({ success: false, message: `Only ${sizeEntry.stock} left in stock` }, { status: 400 });
        }

        if (existingItem) {
            existingItem.quantity = requestedTotal;
        } else {
            cart.items.push({ productId, variantId, size: size.toUpperCase(), quantity });
        }
        
        refreshGuestExpiry(cart, owner);
        await cart.save();
        
        const data = await buildCartResponse(cart, owner);

        const response = NextResponse.json({ success: true, data, message: "Item added to cart" }, { status: 200 });
        return attachGuestCookie(response, owner);
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}