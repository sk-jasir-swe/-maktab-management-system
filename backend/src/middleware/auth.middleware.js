const jwt = require("jsonwebtoken");
const config = require("../config/config");

async function authenticateAdmin(req, res, next) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Access token is required"
            });
        }

        const decoded = jwt.verify(
            token,
            config.jwtSecret
        );

        req.admin = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
}

module.exports = authenticateAdmin;