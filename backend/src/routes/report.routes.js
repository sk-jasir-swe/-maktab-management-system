const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Fee Reports
router.get("/fees", authMiddleware, reportController.getFeeReport);
router.get("/fees/monthly", authMiddleware, reportController.getMonthlyFeeReport);

// Salary Report
router.get("/salaries", authMiddleware, reportController.getSalaryReport);

// Student Report
router.get("/students", authMiddleware, reportController.getStudentReport);

// Admission Report
router.get("/admissions", authMiddleware, reportController.getAdmissionReport);

module.exports = router;