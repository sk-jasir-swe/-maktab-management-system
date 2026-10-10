const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const connectDB = require("../config/db");

async function createAdmin() {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({
            email: "admin@maktab.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const password = await bcrypt.hash("Admin@123", 10);

        await Admin.create({
            name: "Maktab Admin",
            email: "admin@maktab.com",
            password,
            role: "admin"
        });

        console.log("Admin created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error.message);
    }
}

createAdmin();