const Admission = require("../models/admission.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Generate unique Admission Number
function generateApplicationNumber() {
    const year = new Date().getFullYear();

    const uniqueCode = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `MKT-${year}-${uniqueCode}`;
}

// Submit Admission Application
async function createAdmission(req, res) {
    try {
        const {
            studentName,
            fatherName,
            motherName,
            dateOfBirth,
            gender,
            phone,
            address,
            classTime
        } = req.body;

        if (!studentName || !fatherName || !phone || !classTime) {
            return res.status(400).json({
                message: "Student name, father name, phone and class time are required"
            });
        }

        let admission;
        let attempts = 0;

        // Retry if an application number collision occurs
        while (!admission && attempts < 3) {
            attempts++;

            try {
                admission = await Admission.create({
                    applicationNumber: generateApplicationNumber(),
                    studentName,
                    fatherName,
                    motherName,
                    dateOfBirth,
                    gender,
                    phone: phone.trim(),
                    address,
                    classTime,
                    status: "pending"
                });
            } catch (error) {
                if (
                    error.code === 11000 &&
                    error.keyPattern?.applicationNumber
                ) {
                    continue;
                }

                throw error;
            }
        }

        if (!admission) {
            return res.status(500).json({
                message: "Could not generate an application number. Please try again."
            });
        }

        return res.status(201).json({
            message: "Admission submitted successfully",
            applicationNumber: admission.applicationNumber,
            status: admission.status,
            admission
        });
    } catch (error) {
        console.error("Create admission error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Public: Check Admission Status
async function checkAdmissionStatus(req, res) {
    try {
        const { applicationNumber, phone } = req.body;

        if (
            typeof applicationNumber !== "string" ||
            typeof phone !== "string" ||
            !applicationNumber.trim() ||
            !phone.trim()
        ) {
            return res.status(400).json({
                message: "Application number and registered phone number are required"
            });
        }

        const normalizedApplicationNumber =
            applicationNumber.trim().toUpperCase();

        const normalizedPhone = phone.trim();

        const admission = await Admission.findOne({
            applicationNumber: normalizedApplicationNumber,
            phone: normalizedPhone
        }).select(
            "applicationNumber studentName status createdAt updatedAt"
        );

        if (!admission) {
            return res.status(404).json({
                message: "Application not found. Please check your application number and registered phone number."
            });
        }

        return res.status(200).json({
            message: "Application status fetched successfully",
            applicationNumber: admission.applicationNumber,
            studentName: admission.studentName,
            status: admission.status,
            submittedAt: admission.createdAt,
            updatedAt: admission.updatedAt
        });
    } catch (error) {
        console.error("Check admission status error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Admin: Get All Admissions
async function getAdmissions(req, res) {
    try {
        const admissions = await Admission.find().sort({
            createdAt: -1
        });

        return res.status(200).json({
            admissions
        });
    } catch (error) {
        console.error("Get admissions error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Admin: Get Admission By ID
async function getAdmissionById(req, res) {
    try {
        const admission = await Admission.findById(req.params.id);

        if (!admission) {
            return res.status(404).json({
                message: "Admission not found"
            });
        }

        return res.status(200).json({
            admission
        });
    } catch (error) {
        console.error("Get admission error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Admin: Accept or Reject Admission
async function updateAdmissionStatus(req, res) {
    const session = await mongoose.startSession();

    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        session.startTransaction();

        const admission = await Admission.findById(
            req.params.id
        ).session(session);

        if (!admission) {
            await session.abortTransaction();

            return res.status(404).json({
                message: "Admission not found"
            });
        }

        if (admission.status !== "pending") {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Admission has already been processed"
            });
        }

        // Reject admission
        if (status === "rejected") {
            admission.status = "rejected";

            await admission.save({ session });
            await session.commitTransaction();

            return res.status(200).json({
                message: "Admission rejected",
                admission
            });
        }

        // Accept admission
        admission.status = "accepted";

        await admission.save({ session });

        const student = await Student.create(
            [
                {
                    name: admission.studentName,
                    fatherName: admission.fatherName,
                    motherName: admission.motherName,
                    dateOfBirth: admission.dateOfBirth,
                    gender: admission.gender,
                    phone: admission.phone,
                    address: admission.address,
                    classTime: admission.classTime
                }
            ],
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            message: "Admission accepted and student created",
            admission,
            student: student[0]
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Update admission status error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    } finally {
        await session.endSession();
    }
}

module.exports = {
    createAdmission,
    checkAdmissionStatus,
    getAdmissions,
    getAdmissionById,
    updateAdmissionStatus
};