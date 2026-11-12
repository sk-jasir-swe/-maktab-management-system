const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
    {
        applicationNumber: {
            type: String,
            unique: true,
            immutable: true,
            trim: true,
            uppercase: true,
            sparse: true
        },

        studentName: {
            type: String,
            required: true,
            trim: true
        },

        aadhaarNo: {
            type: String,
            trim: true
        },

        age: {
            type: Number,
            min: 0,
            max: 120
        },

        fatherName: {
            type: String,
            trim: true
        },

        guardianName: {
            type: String,
            trim: true
        },

        guardianAadhaarNo: {
            type: String,
            trim: true
        },

        guardianProfession: {
            type: String,
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
            trim: true,
            match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"]
        },

        whatsappNumber: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^\d{10}$/,
                "WhatsApp number must contain exactly 10 digits"
            ]
        },

        address: {
            type: String,
            trim: true
        },

        permanentAddress: {
            type: String,
            trim: true
        },

        residentialAddress: {
            type: String,
            trim: true
        },

        schoolName: {
            type: String,
            trim: true
        },

        schoolClass: {
            type: String,
            trim: true
        },

        schoolHour: {
            type: String,
            trim: true
        },

        tuitionHour: {
            type: String,
            trim: true
        },

        preferredTime: {
            type: String,
            trim: true
        },

        preferredCourseClass: {
            type: String,
            trim: true
        },

        classTime: {
            type: String,
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
