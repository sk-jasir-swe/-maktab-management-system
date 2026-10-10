const studentModel = require("../models/student.model");
const teacherModel = require("../models/teacher.model");
const admissionModel = require("../models/admission.model");
const feePaymentModel = require("../models/feePayment.model");
const salaryPaymentModel = require("../models/salaryPayment.model");
const examModel = require("../models/exam.model");

const getDashboard = async (req, res) => {
    try {
        // Current month ki date range
        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        // Dashboard data fetch karo
        const [
            totalStudents,
            activeStudents,
            totalTeachers,
            pendingAdmissions,
            monthlyFeeCollection,
            monthlySalaryExpenses,
            upcomingExams
        ] = await Promise.all([
            studentModel.countDocuments(),

            studentModel.countDocuments({
                status: "active"
            }),

            teacherModel.countDocuments(),

            admissionModel.countDocuments({
                status: "pending"
            }),

            feePaymentModel.aggregate([
                {
                    $match: {
                        status: "paid",
                        paymentDate: {
                            $gte: startOfMonth,
                            $lt: startOfNextMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]),

            salaryPaymentModel.aggregate([
                {
                    $match: {
                        status: "paid",
                        paymentDate: {
                            $gte: startOfMonth,
                            $lt: startOfNextMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]),

            examModel.countDocuments({
                status: "upcoming",
                date: {
                    $gte: now
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalStudents,
                activeStudents,
                totalTeachers,
                pendingAdmissions,
                monthlyFeeCollection:
                    monthlyFeeCollection[0]?.total || 0,
                monthlySalaryExpenses:
                    monthlySalaryExpenses[0]?.total || 0,
                upcomingExams
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};