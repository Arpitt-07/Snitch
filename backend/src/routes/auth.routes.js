import { Router } from "express";
import { registerSchema, loginSchema } from "../utils/validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { register, login, logout, refreshAccessToken } from "../controllers/auth.controller.js";

const authRouter = Router();

// Public routes
authRouter.post("/register", validateRequest(registerSchema), register);
authRouter.post("/login", validateRequest(loginSchema), login);
authRouter.post("/refresh-token", refreshAccessToken);

// Secured routes
authRouter.post("/logout", verifyJWT, logout);

export default authRouter;
