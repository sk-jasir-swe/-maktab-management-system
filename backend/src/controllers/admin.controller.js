const bcrypt = require("bcryptjs");

const Admin = require("../models/admin.model");
const Session = require("../models/session.model");

const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} = require("../services/token.service");


async function loginAdmin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(
            admin._id,
            admin.role
        );

        const refreshToken = generateRefreshToken();

        const refreshTokenHash = hashRefreshToken(refreshToken);

        await Session.create({
            admin: admin._id,
            refreshTokenHash,
            revoked: false,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



async function refreshAccessToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is required"
            });
        }

        const refreshTokenHash = hashRefreshToken(refreshToken);

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        if (session.expiresAt < new Date()) {
            return res.status(401).json({
                message: "Refresh token expired"
            });
        }

        const admin = await Admin.findById(session.admin);

        if (!admin) {
            return res.status(401).json({
                message: "Admin not found"
            });
        }

        const accessToken = generateAccessToken(
            admin._id,
            admin.role
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: "Access token refreshed"
        });

    } catch (error) {
        console.error("Refresh token error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function logoutAdmin(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token is required"
            });
        }

        const refreshTokenHash = hashRefreshToken(refreshToken);

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        session.revoked = true;

        await session.save();

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Admin logout error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    loginAdmin,
    refreshAccessToken,
    logoutAdmin
};