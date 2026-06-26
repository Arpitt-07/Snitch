import app from "./src/app.js";
import connectDB from "./src/database/db.js";
import { config } from "./src/config.js";

const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
    }
};

startServer();