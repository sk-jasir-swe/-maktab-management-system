const express = require("express");

const feePaymentController = require("../controllers/feePayment.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();

router.get(
    "/monthly-fee-settings",
    authenticateAdmin,
    feePaymentController.getMonthlyFeeSettings
);

router.put(
    "/monthly-fee-settings",
    authenticateAdmin,
    feePaymentController.updateMonthlyFeeSettings
);

router.post(
    "/",
    authenticateAdmin,
    feePaymentController.createFeePayment
);

router.get(
    "/",
    authenticateAdmin,
    feePaymentController.getFeePayments
);

router.get(
    "/student/:studentId",
    authenticateAdmin,
    validateObjectId,
    feePaymentController.getStudentFeePayments
);

router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    feePaymentController.getFeePaymentById
);

router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    feePaymentController.updateFeePayment
);

module.exports = router;
