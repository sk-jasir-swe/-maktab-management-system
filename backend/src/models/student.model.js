const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: {
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
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        photo: {
            url: {
                type: String
            },
            fileId: {
                type: String
            }
        },

        admissionDate: {
            type: Date,
            default: Date.now
        },

        classTime: {
            type: String,
            enum: ["morning", "after_asr", "after_maghrib"],
            required: true
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

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;