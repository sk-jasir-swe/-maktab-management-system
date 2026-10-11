const Teacher = require("../models/teacher.model");

const {
    uploadPhoto,
    deletePhoto
} = require("../services/imagekit.service");


// Create Teacher
async function createTeacher(req, res) {
    try {
        const {
            name,
            phone,
            whatsappNumber,
            email,
            subject,
            address,
            joiningDate,
            status
        } = req.body;

        let photo;

        // Upload teacher photo to ImageKit
        if (req.file) {
            try {
                photo = await uploadPhoto(
                    req.file,
                    "teachers"
                );
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Photo upload failed",
                    error:
                        uploadError.message ||
                        "Invalid image upload"
                });
            }
        }

        const teacher = await Teacher.create({
            name,
            phone,
            whatsappNumber,
            email,
            subject,
            address,
            photo,
            joiningDate,
            status
        });

        return res.status(201).json({
            message: "Teacher created successfully",
            teacher
        });

    } catch (error) {
        console.error("Create teacher error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Teachers
async function getTeachers(req, res) {
    try {
        const teachers = await Teacher.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            teachers
        });

    } catch (error) {
        console.error("Get teachers error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Teacher
async function getTeacherById(req, res) {
    try {
        const teacher = await Teacher.findById(
            req.params.id
        );

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        return res.status(200).json({
            teacher
        });

    } catch (error) {
        console.error("Get teacher error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid teacher ID"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Teacher
async function updateTeacher(req, res) {
    try {
        const {
            name,
            phone,
            whatsappNumber,
            email,
            subject,
            address,
            joiningDate,
            status
        } = req.body;

        const existingTeacher = await Teacher.findById(
            req.params.id
        );

        if (!existingTeacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        const updateData = {};

        // Update fields only when provided
        if (name !== undefined) {
            updateData.name = name;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
        }

        if (whatsappNumber !== undefined) {
            updateData.whatsappNumber = whatsappNumber;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (subject !== undefined) {
            updateData.subject = subject;
        }

        if (address !== undefined) {
            updateData.address = address;
        }

        if (joiningDate !== undefined) {
            updateData.joiningDate = joiningDate;
        }

        if (status !== undefined) {
            updateData.status = status.toLowerCase();
        }

        // Upload a new photo if provided
        if (req.file) {
            let newPhoto;

            try {
                newPhoto = await uploadPhoto(
                    req.file,
                    "teachers"
                );
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Photo upload failed",
                    error:
                        uploadError.message ||
                        "Invalid image upload"
                });
            }

            updateData.photo = newPhoto;
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        // Delete old ImageKit photo only after successful update
        if (
            req.file &&
            existingTeacher.photo?.fileId &&
            teacher
        ) {
            try {
                await deletePhoto(
                    existingTeacher.photo.fileId
                );
            } catch (deleteError) {
                console.error(
                    "Old teacher photo deletion failed:",
                    deleteError
                );
            }
        }

        return res.status(200).json({
            message: "Teacher updated successfully",
            teacher
        });

    } catch (error) {
        console.error("Update teacher error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid teacher ID"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Delete Teacher
async function deleteTeacher(req, res) {
    try {
        const teacher = await Teacher.findByIdAndDelete(
            req.params.id
        );

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        // Delete teacher photo from ImageKit
        if (teacher.photo?.fileId) {
            try {
                await deletePhoto(
                    teacher.photo.fileId
                );
            } catch (deleteError) {
                console.error(
                    "Teacher photo deletion failed:",
                    deleteError
                );
            }
        }

        return res.status(200).json({
            message: "Teacher deleted successfully"
        });

    } catch (error) {
        console.error("Delete teacher error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid teacher ID"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};