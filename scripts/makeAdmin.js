// scripts/makeAdmin.js
import connectDB from "../src/lib/db.js";
import User from "../src/models/user.model.js";

const email = process.argv[2];

if (!email) {
    console.error("Usage: node scripts/makeAdmin.js someone@example.com");
    process.exit(1);
}

await connectDB();

const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
);

if (!user) {
    console.error("No user found with that email");
} else {
    console.log(`${user.email} is now an admin`);
}

process.exit(0);