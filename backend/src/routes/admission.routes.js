const express = require("express");

const admissionController = require("../controllers/admission.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();


router.post(
    "/",
    admissionController.createAdmission
);


router.get(
    "/",
    authenticateAdmin,
    admissionController.getAdmissions
);


router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    admissionController.getAdmissionById
);


router.patch(
    "/:id/status",
    authenticateAdmin,
    validateObjectId,
    admissionController.updateAdmissionStatus
);


module.exports = router;