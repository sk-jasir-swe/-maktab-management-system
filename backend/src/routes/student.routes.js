const express = require("express");

const studentController = require("../controllers/student.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const uploadStudentPhoto = require("../middleware/upload.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();

router.post(
    "/",
    authenticateAdmin,
    uploadStudentPhoto,
    studentController.createStudent
);

router.get(
    "/",
    authenticateAdmin,
    studentController.getStudents
);

router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    studentController.getStudentById
);

router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    uploadStudentPhoto,
    studentController.updateStudent
);

router.delete(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    studentController.deleteStudent
);

module.exports = router;