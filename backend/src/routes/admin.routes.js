const express = require("express");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.post("/login", adminController.loginAdmin);

router.post("/refresh", adminController.refreshAccessToken);

router.post("/logout", adminController.logoutAdmin);

module.exports = router;