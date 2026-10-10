const express = require("express");

const examController = require("../controllers/exam.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();


router.post(
    "/",
    authenticateAdmin,
    examController.createExam
);


router.get(
    "/",
    authenticateAdmin,
    examController.getExams
);


router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examController.getExamById
);


router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examController.updateExam
);


router.delete(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examController.deleteExam
);


module.exports = router;