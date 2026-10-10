const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Teacher name is required"],
            trim: true
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [/^\d{10}$/, "Phone number must be 10 digits"]
        },

        whatsappNumber: {
            type: String,
            required: [true, "WhatsApp number is required"],
            trim: true,
            match: [
                /^\d{10}$/,
                "WhatsApp number must be 10 digits"
            ]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        photo: {
            url: {
                type: String,
                trim: true
            },

            fileId: {
                type: String,
                trim: true
            }
        },

        joiningDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Teacher", teacherSchema);