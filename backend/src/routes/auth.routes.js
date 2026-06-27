import { Router } from "express";
import { registerSchema, loginSchema } from "../utils/validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { register, login, logout, refreshAccessToken, getCurrentUser, googleAuthCallback } from "../controllers/auth.controller.js";
import passport from "passport";

const authRouter = Router();

// Public routes
authRouter.post("/register", validateRequest(registerSchema), register);
authRouter.post("/login", validateRequest(loginSchema), login);
authRouter.post("/refresh-token", refreshAccessToken);

// Secured routes
authRouter.post("/logout", verifyJWT, logout);
authRouter.get("/current-user", verifyJWT, getCurrentUser);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }))
authRouter.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login"
}), googleAuthCallback)

export default authRouter;
