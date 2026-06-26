import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Skip validation for password, etc.

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Something went wrong while generating refresh and access tokens");
    }
};

export const register = async (req, res) => {
    try {
        const { username, email, password, phone, isSeller } = req.body;

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(400).json({ success: false, message: "User with email or username already exists" });
        }

        const user = await User.create({
            username,
            email,
            password,
            phone,
            role: isSeller ? "seller" : "buyer"
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User registered and logged in successfully",
                user: createdUser
            });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: "Failed to register user", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid user credentials" });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User logged in successfully",
                user: loggedInUser
            });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to log in", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to log out", error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, config.JWT_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token is expired or used" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                success: true,
                message: "Access token refreshed",
                accessToken,
                refreshToken: newRefreshToken
            });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid refresh token", error: error.message });
    }
};
