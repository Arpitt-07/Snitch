// src/models/order.model.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    image: { type: String },
    color: { type: String },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
}, { _id: false });

const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    address: { type: addressSchema, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);