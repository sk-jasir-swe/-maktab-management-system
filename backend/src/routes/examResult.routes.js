const express = require("express");

const examResultController = require("../controllers/examResult.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();


// Create Exam Result
router.post(
    "/",
    authenticateAdmin,
    examResultController.createExamResult
);


// Get All Exam Results
router.get(
    "/",
    authenticateAdmin,
    examResultController.getExamResults
);


// Get Results of One Student
router.get(
    "/student/:studentId",
    authenticateAdmin,
    validateObjectId,
    examResultController.getStudentExamResults
);


// Get Results of One Exam
router.get(
    "/exam/:examId",
    authenticateAdmin,
    validateObjectId,
    examResultController.getExamResultsByExam
);


// Get Single Exam Result
router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examResultController.getExamResultById
);


// Update Exam Result
router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examResultController.updateExamResult
);


// Delete Exam Result
router.delete(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    examResultController.deleteExamResult
);


module.exports = router;