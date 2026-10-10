const Admission = require("../models/admission.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");


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

        const admission = await Admission.create({
            studentName,
            fatherName,
            motherName,
            dateOfBirth,
            gender,
            phone,
            address,
            classTime
        });

        return res.status(201).json({
            message: "Admission submitted successfully",
            admission
        });

    } catch (error) {
        console.error("Create admission error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



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



async function getAdmissionById(req, res) {
    try {
        const admission = await Admission.findById(
            req.params.id
        );

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
        await session.abortTransaction();

        console.error(
            "Update admission status error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });

    } finally {
        await session.endSession();
    }
}

module.exports = {
    createAdmission,
    getAdmissions,
    getAdmissionById,
    updateAdmissionStatus
};