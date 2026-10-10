const mongoose = require("mongoose");
const config = require("./config");

async function ConnectDB() {
    try {
        await mongoose.connect(config.mongoURI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

module.exports = ConnectDB;