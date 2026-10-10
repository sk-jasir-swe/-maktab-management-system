const express = require("express");

const salaryPaymentController = require("../controllers/salaryPayment.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();


// Create Salary Payment
router.post(
    "/",
    authenticateAdmin,
    salaryPaymentController.createSalaryPayment
);


// Get All Salary Payments
router.get(
    "/",
    authenticateAdmin,
    salaryPaymentController.getSalaryPayments
);


// Get Salary Payments of One Teacher
router.get(
    "/teacher/:teacherId",
    authenticateAdmin,
    validateObjectId,
    salaryPaymentController.getTeacherSalaryPayments
);


// Get Single Salary Payment
router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    salaryPaymentController.getSalaryPaymentById
);


// Update Salary Payment
router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    salaryPaymentController.updateSalaryPayment
);


module.exports = router;