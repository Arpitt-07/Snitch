import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "../config.js";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["buyer","seller"],
        default:"buyer"
    },
    refreshToken: {
        type: String
    }

}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    try {
        if (!this.isModified('password')) { return; }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    catch (error) {
        console.error(error);
    }
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        config.JWT_SECRET,
        {
            expiresIn: "20m"
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        config.JWT_SECRET,
        {
            expiresIn: "2d"
        }
    )
}


export const User = mongoose.model("User", userSchema);