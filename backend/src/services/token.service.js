const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");

function generateAccessToken(adminId, role) {
    return jwt.sign(
        {
            id: adminId,
            role: role
        },
        config.jwtSecret,
        {
            expiresIn: "15m"
        }
    );
}

function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(refreshToken) {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
};