const express = require("express");
const adminController = require("../controllers/admin.controller");
const authenticateAdmin = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", adminController.loginAdmin);

router.post("/refresh", adminController.refreshAccessToken);

router.post("/logout", adminController.logoutAdmin);

router.post("/change-password", authenticateAdmin, adminController.changeAdminPassword);

module.exports = router;
