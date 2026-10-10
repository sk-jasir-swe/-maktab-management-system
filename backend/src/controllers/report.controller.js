const feePaymentModel = require("../models/feePayment.model");
const salaryPaymentModel = require("../models/salaryPayment.model");
const studentModel = require("../models/student.model");
const admissionModel = require("../models/admission.model");

const getFeeReport = async (req, res) => {
    try {
        const report = await feePaymentModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    totalPayments: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Fee report fetched successfully",
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch fee report",
            error: error.message
        });
    }
};

const getMonthlyFeeReport = async (req, res) => {
    try {
        const report = await feePaymentModel.aggregate([
            {
                $match: {
                    status: "paid"
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    totalAmount: { $sum: "$amount" },
                    totalPayments: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Monthly fee report fetched successfully",
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch monthly fee report",
            error: error.message
        });
    }
};

const getSalaryReport = async (req, res) => {
    try {
        const report = await salaryPaymentModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    totalPayments: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Salary report fetched successfully",
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch salary report",
            error: error.message
        });
    }
};

const getStudentReport = async (req, res) => {
    try {
        const [
            totalStudents,
            activeStudents,
            inactiveStudents
        ] = await Promise.all([
            studentModel.countDocuments(),
            studentModel.countDocuments({ status: "active" }),
            studentModel.countDocuments({ status: "inactive" })
        ]);

        return res.status(200).json({
            success: true,
            message: "Student report fetched successfully",
            data: {
                totalStudents,
                activeStudents,
                inactiveStudents
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student report",
            error: error.message
        });
    }
};

const getAdmissionReport = async (req, res) => {
    try {
        const report = await admissionModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalAdmissions: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Admission report fetched successfully",
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admission report",
            error: error.message
        });
    }
};

module.exports = {
    getFeeReport,
    getMonthlyFeeReport,
    getSalaryReport,
    getStudentReport,
    getAdmissionReport
};