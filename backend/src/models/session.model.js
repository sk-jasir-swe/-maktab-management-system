const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },

        refreshTokenHash: {
            type: String,
            required: true
        },

        revoked: {
            type: Boolean,
            default: false
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;