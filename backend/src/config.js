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
if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("Missing GOOGLE_CLIENT_ID")
}
if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("Missing GOOGLE_CLIENT_SECRET")
}
if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY")
}

export const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
}

