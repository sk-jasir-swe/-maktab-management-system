const express = require("express");

const noticeController = require("../controllers/notice.controller");
const authenticateAdmin = require("../middleware/auth.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");

const router = express.Router();

// Public API: bina login ke active notices dekh sakte hain
router.get("/", noticeController.getNotices);

// Admin-only APIs
router.post(
    "/",
    authenticateAdmin,
    noticeController.createNotice
);

router.get(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    noticeController.getNoticeById
);

router.put(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    noticeController.updateNotice
);

router.delete(
    "/:id",
    authenticateAdmin,
    validateObjectId,
    noticeController.deleteNotice
);

module.exports = router;