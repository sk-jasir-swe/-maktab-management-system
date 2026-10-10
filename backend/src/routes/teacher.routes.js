const express = require("express");

const teacherController = require("../controllers/teacher.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const uploadStudentPhoto = require("../middleware/upload.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();

// Create Teacher - Admin only
router.post(
    "/",
    authenticateAdmin,
    uploadStudentPhoto,
    teacherController.createTeacher
);

// Get All Teachers - Public
router.get(
    "/",
    teacherController.getTeachers
);

// Get Single Teacher - Admin only
router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    teacherController.getTeacherById
);

// Update Teacher - Admin only
router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    uploadStudentPhoto,
    teacherController.updateTeacher
);

// Delete Teacher - Admin only
router.delete(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    teacherController.deleteTeacher
);

module.exports = router;