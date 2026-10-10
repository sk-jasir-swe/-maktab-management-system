const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        feeType: {
            type: String,
            enum: ["admission", "monthly", "exam"],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        month: {
            type: String,
            trim: true
        },

        exam: {
            type: String,
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

const FeePayment = mongoose.model(
    "FeePayment",
    feePaymentSchema
);

module.exports = FeePayment;