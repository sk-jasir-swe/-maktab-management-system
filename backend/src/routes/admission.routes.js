const express = require("express");

const admissionController = require("../controllers/admission.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();

// Public: Submit Admission Application
router.post(
    "/",
    admissionController.createAdmission
);

// Public: Check Admission Status
router.post(
    "/check-status",
    admissionController.checkAdmissionStatus
);

// Admin: Get All Admissions
router.get(
    "/",
    authenticateAdmin,
    admissionController.getAdmissions
);

// Admin: Get Admission By ID
router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    admissionController.getAdmissionById
);

// Admin: Accept or Reject Admission
router.patch(
    "/:id/status",
    authenticateAdmin,
    validateObjectId,
    admissionController.updateAdmissionStatus
);

module.exports = router;