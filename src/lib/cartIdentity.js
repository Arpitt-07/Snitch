import { randomUUID } from "crypto";
import { verifyJWT } from "@/lib/verifyJWT.js";

export async function resolveCartOwner(req) {
    try {
        const user = await verifyJWT(req);
        return { type: "user", userId: user._id };
    } catch {
        // not logged in, or token invalid/expired — fall back to guest identity
    }

    const existingSessionId = req.cookies.get("guestCartId")?.value;
    if (existingSessionId) {
        return { type: "guest", sessionId: existingSessionId, isNew: false };
    }

    return { type: "guest", sessionId: randomUUID(), isNew: true };
}

export function attachGuestCookie(response, owner) {
    if (owner.type === "guest" && owner.isNew) {
        response.cookies.set("guestCartId", owner.sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });
    }
    return response;
}

export function refreshGuestExpiry(cart, owner) {
    if (owner.type === "guest") {
        cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
}