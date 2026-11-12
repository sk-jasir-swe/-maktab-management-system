require("dotenv").config();

const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const connectDB = require("../config/db");

async function resetAdminPassword() {
    try {
        const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_OLD_EMAIL } = process.env;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env");
        }

        await connectDB();

        const admin = await Admin.findOne({ email: ADMIN_OLD_EMAIL || ADMIN_EMAIL });

        if (!admin) {
            throw new Error(`No admin account found for ${ADMIN_EMAIL}`);
        }

        admin.email = ADMIN_EMAIL;
        admin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await admin.save();

        console.log(`Password updated for ${ADMIN_EMAIL}`);
    } catch (error) {
        console.error("Admin password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        const mongoose = require("mongoose");
        await mongoose.disconnect();
    }
}

resetAdminPassword();
