import dotenv from "dotenv";
dotenv.config();
if (!process.env.PORT) {
    throw new Error("Missing PORT")
}
if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI")
}
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET")
}

export const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
}

