const mongoose = require("mongoose");

const classFeeSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const feeSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "monthly-fees"
        },
        classAmounts: {
            type: [classFeeSchema],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("FeeSetting", feeSettingSchema);
