const Student = require("../models/student.model");
const {
    uploadPhoto,
    deletePhoto
} = require("../services/imagekit.service");


// Create Student
async function createStudent(req, res) {
    try {
        const {
            rollNo,
            codeNo,
            formNo,
            name,
            fatherName,
            guardianName,
            motherName,
            aadhaarNo,
            guardianAadhaarNo,
            guardianProfession,
            age,
            dateOfBirth,
            gender,
            phone,
            whatsappNumber,
            permanentAddress,
            residentialAddress,
            schoolName,
            schoolClass,
            schoolHour,
            tuitionHour,
            preferredTime,
            preferredCourseClass,
            address,
            admissionDate,
            classTime,
            status
        } = req.body;

        let photo;

        if (req.file) {
            try {
                photo = await uploadPhoto(
                    req.file,
                    "students"
                );
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Photo upload failed",
                    error: uploadError.message || "Invalid image upload"
                });
            }
        }

        const student = await Student.create({
            rollNo,
            codeNo,
            formNo,
            name,
            fatherName: guardianName || fatherName,
            guardianName: guardianName || fatherName,
            motherName,
            aadhaarNo,
            guardianAadhaarNo,
            guardianProfession,
            age: age === "" ? undefined : age,
            dateOfBirth,
            gender: gender ? gender.toLowerCase() : gender,
            phone,
            whatsappNumber,
            permanentAddress: permanentAddress || address,
            residentialAddress,
            schoolName,
            schoolClass,
            schoolHour,
            tuitionHour,
            preferredTime: preferredTime || classTime,
            preferredCourseClass,
            address: permanentAddress || address,
            photo,
            admissionDate,
            classTime: (preferredTime || classTime)?.toLowerCase(),
            status: status ? status.toLowerCase() : status
        });

        return res.status(201).json({
            message: "Student created successfully",
            student
        });

    } catch (error) {
        console.error("Create student error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Students
async function getStudents(req, res) {
    try {
        const students = await Student.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            students
        });

    } catch (error) {
        console.error("Get students error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Student
async function getStudentById(req, res) {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            student
        });

    } catch (error) {
        console.error("Get student error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Student
async function updateStudent(req, res) {
    try {
        const {
            rollNo,
            codeNo,
            formNo,
            name,
            fatherName,
            guardianName,
            motherName,
            aadhaarNo,
            guardianAadhaarNo,
            guardianProfession,
            age,
            dateOfBirth,
            gender,
            phone,
            whatsappNumber,
            permanentAddress,
            residentialAddress,
            schoolName,
            schoolClass,
            schoolHour,
            tuitionHour,
            preferredTime,
            preferredCourseClass,
            address,
            admissionDate,
            classTime,
            status
        } = req.body;

        const updateData = {};

        // Find existing student first
        const existingStudent = await Student.findById(
            req.params.id
        );

        if (!existingStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Upload new photo
        if (req.file) {
            try {
                const newPhoto = await uploadPhoto(
                    req.file,
                    "students"
                );

                // Delete old photo from ImageKit
                if (existingStudent.photo?.fileId) {
                    await deletePhoto(
                        existingStudent.photo.fileId
                    );
                }

                updateData.photo = newPhoto;

            } catch (uploadError) {
                return res.status(400).json({
                    message: "Photo upload failed",
                    error: uploadError.message || "Invalid image upload"
                });
            }
        }

        if (name !== undefined) updateData.name = name;
        if (rollNo !== undefined) updateData.rollNo = rollNo;
        if (codeNo !== undefined) updateData.codeNo = codeNo;
        if (formNo !== undefined) updateData.formNo = formNo;
        if (fatherName !== undefined) updateData.fatherName = fatherName;
        if (guardianName !== undefined) {
            updateData.guardianName = guardianName;
            updateData.fatherName = guardianName;
        }
        if (motherName !== undefined) updateData.motherName = motherName;
        if (aadhaarNo !== undefined) updateData.aadhaarNo = aadhaarNo;
        if (guardianAadhaarNo !== undefined) updateData.guardianAadhaarNo = guardianAadhaarNo;
        if (guardianProfession !== undefined) updateData.guardianProfession = guardianProfession;
        if (age !== undefined) updateData.age = age === "" ? null : age;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

        if (gender !== undefined) {
            updateData.gender = gender.toLowerCase();
        }

        if (phone !== undefined) updateData.phone = phone;
        if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
        if (address !== undefined) updateData.address = address;
        if (permanentAddress !== undefined) {
            updateData.permanentAddress = permanentAddress;
            updateData.address = permanentAddress;
        }
        if (residentialAddress !== undefined) updateData.residentialAddress = residentialAddress;
        if (schoolName !== undefined) updateData.schoolName = schoolName;
        if (schoolClass !== undefined) updateData.schoolClass = schoolClass;
        if (schoolHour !== undefined) updateData.schoolHour = schoolHour;
        if (tuitionHour !== undefined) updateData.tuitionHour = tuitionHour;
        if (preferredTime !== undefined) {
            updateData.preferredTime = preferredTime;
            updateData.classTime = preferredTime.toLowerCase();
        }
        if (preferredCourseClass !== undefined) updateData.preferredCourseClass = preferredCourseClass;

        if (admissionDate !== undefined) {
            updateData.admissionDate = admissionDate;
        }

        if (classTime !== undefined) {
            updateData.classTime = classTime.toLowerCase();
        }

        if (status !== undefined) {
            updateData.status = status.toLowerCase();
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error("Update student error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Delete Student
async function deleteStudent(req, res) {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Delete photo from ImageKit
        if (student.photo?.fileId) {
            await deletePhoto(
                student.photo.fileId
            );
        }

        return res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete student error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
