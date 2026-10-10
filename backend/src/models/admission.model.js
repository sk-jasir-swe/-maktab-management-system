const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: true,
            trim: true
        },

        fatherName: {
            type: String,
            required: true,
            trim: true
        },

        motherName: {
            type: String,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        classTime: {
            type: String,
            enum: ["morning", "after_asr", "after_maghrib"],
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Admission = mongoose.model("Admission", admissionSchema);

module.exports = Admission;