const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        rollNo: {
            type: String,
            trim: true
        },

        codeNo: {
            type: String,
            trim: true
        },

        formNo: {
            type: String,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        fatherName: {
            type: String,
            trim: true
        },

        guardianName: {
            type: String,
            trim: true
        },

        aadhaarNo: {
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

        age: {
            type: Number,
            min: 0,
            max: 120
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
            trim: true,
            match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"]
        },

        whatsappNumber: {
            type: String,
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
