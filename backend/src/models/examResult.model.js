const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        marks: {
            type: Number,
            required: true,
            min: 0
        },

        totalMarks: {
            type: Number,
            required: true,
            min: 1
        },

        grade: {
            type: String,
            trim: true
        },

        remarks: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const ExamResult = mongoose.model(
    "ExamResult",
    examResultSchema
);

module.exports = ExamResult;