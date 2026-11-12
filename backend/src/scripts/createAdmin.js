require("dotenv").config();

const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const connectDB = require("../config/db");

async function createAdmin() {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in backend/.env");
        }

        await connectDB();

        const existingAdmin = await Admin.findOne({
            email: ADMIN_EMAIL
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

        await Admin.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password,
            role: "admin"
        });

        console.log("Admin created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error.message);
    }
}

createAdmin();
