"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import api from "@/lib/axios";
import { fetchCart } from "@/store/cartSlice";

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { items, total } = useSelector((state) => state.cart);

    const [address, setAddress] = useState({
        fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
    });
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

    const handleChange = (field) => (e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }));

    const handlePayment = async (e) => {
        e.preventDefault();
        setError("");

        if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
            setError("Please fill in all required address fields");
            return;
        }

        setProcessing(true);

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError("Failed to load payment gateway. Check your connection and try again.");
                setProcessing(false);
                return;
            }

            const { data } = await api.post("/orders/checkout");
            const { razorpayOrderId, amount, currency, keyId } = data.data;

            const options = {
                key: keyId,
                amount: amount * 100,
                currency,
                name: "Snitch",
                description: "Order Payment",
                order_id: razorpayOrderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post("/orders/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            address,
                        });
                        dispatch(fetchCart()); // cart is now empty server-side — sync Redux
                        router.push(`/orders/${verifyRes.data.data._id}`);
                    } catch (err) {
                        setError(err.response?.data?.message || "Payment verification failed");
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setProcessing(false), // user closed the modal without paying
                },
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                },
                theme: { color: "#121214" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", (response) => {
                setError(response.error?.description || "Payment failed");
                setProcessing(false);
            });
            razorpay.open();
        } catch (err) {
            setError(err.response?.data?.message || "Could not start checkout");
            setProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="font-mono text-xs uppercase tracking-widest opacity-40">Your cart is empty — nothing to check out.</p>
            </div>
        );
    }

    return (
        <div className="p-6 pt-32 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
                <h1 className="text-2xl font-bold uppercase tracking-tighter">Shipping Address</h1>
                <form onSubmit={handlePayment} className="space-y-4">
                    {error && <p className="text-red-600 text-xs font-mono uppercase tracking-widest">{error}</p>}

                    <div className="space-y-1">
                        <input
                            placeholder="Full name"
                            value={address.fullName}
                            onChange={handleChange("fullName")}
                            className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                            autoComplete="name"
                        />
                    </div>
                    <div className="space-y-1">
                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={address.phone}
                            onChange={handleChange("phone")}
                            className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                            autoComplete="tel"
                        />
                    </div>
                    <div className="space-y-1">
                        <input
                            placeholder="Address line 1"
                            value={address.line1}
                            onChange={handleChange("line1")}
                            className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                            autoComplete="address-line1"
                        />
                    </div>
                    <div className="space-y-1">
                        <input
                            placeholder="Address line 2 (optional)"
                            value={address.line2}
                            onChange={handleChange("line2")}
                            className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                            autoComplete="address-line2"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <input
                                placeholder="City"
                                value={address.city}
                                onChange={handleChange("city")}
                                className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                                autoComplete="address-level2"
                            />
                        </div>
                        <div className="space-y-1">
                            <input
                                placeholder="State"
                                value={address.state}
                                onChange={handleChange("state")}
                                className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                                autoComplete="address-level1"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <input
                            placeholder="Pincode"
                            value={address.pincode}
                            onChange={handleChange("pincode")}
                            className="w-full border border-ink/10 p-3 outline-none focus:border-ink transition-colors text-sm"
                            autoComplete="postal-code"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] font-bold text-xs transition-all duration-300 active:scale-[0.98] disabled:bg-gray-400"
                    >
                        {processing ? "Processing..." : `Pay ${formatPrice(total)}`}
                    </button>
                </form>
            </div>

            <div className="bg-white/50 p-8 border border-ink/10 rounded-sm h-fit">
                <h2 className="text-xl font-bold uppercase tracking-tighter mb-6">Order Summary</h2>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item._id} className="flex justify-between text-xs font-mono">
                            <span className="truncate mr-4">{item.title} ({item.color} / {item.size}) × {item.quantity}</span>
                            <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-ink/10 mt-6 pt-4 flex justify-between font-bold uppercase tracking-tighter">
                    <span className="text-sm">Total</span>
                    <span className="text-xl">{formatPrice(total)}</span>
                </div>
            </div>
        </div>
    );
}