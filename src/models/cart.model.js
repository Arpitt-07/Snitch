// src/models/cart.model.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: true });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    sessionId: { type: String, unique: true, sparse: true },
    items: [cartItemSchema],
    expiresAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);