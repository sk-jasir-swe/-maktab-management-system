const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error("Only JPG, PNG and WEBP images are allowed"),
            false
        );
    }

    cb(null, true);
};

const uploadStudentPhoto = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
}).single("photo");

module.exports = uploadStudentPhoto;