const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        month: {
            type: String,
            required: true,
            trim: true
        },

        paymentDate: {
            type: Date,
            default: Date.now
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi"],
            required: true
        },

        status: {
            type: String,
            enum: ["paid", "pending", "cancelled"],
            default: "paid"
        },

        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const SalaryPayment = mongoose.model(
    "SalaryPayment",
    salaryPaymentSchema
);

module.exports = SalaryPayment;