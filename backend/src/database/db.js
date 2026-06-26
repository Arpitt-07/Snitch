import mongoose from "mongoose";
import { config } from "../config.js";

const connectDB = async () => {

    try {
        const conn = await mongoose.connect(config.MONGO_URI, {
            dbName: "Snitch_DB"

        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default connectDB