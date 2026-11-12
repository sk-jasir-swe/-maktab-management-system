const FeePayment = require("../models/feePayment.model");
const Student = require("../models/student.model");
let currentMonthFeeGeneration = null;

function getCurrentBillingMonth() {
    const parts = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit"
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === "year").value;
    const month = parts.find((part) => part.type === "month").value;
    return `${year}-${month}`;
}

async function ensureCurrentMonthPendingFees() {
    if (currentMonthFeeGeneration) return currentMonthFeeGeneration;

    currentMonthFeeGeneration = (async () => {
        const month = getCurrentBillingMonth();
        const activeStudents = await Student.find({ status: "active" }).select("_id");
        if (!activeStudents.length) return;

        const existingMonthlyFees = await FeePayment.find({
            student: { $in: activeStudents.map((student) => student._id) },
            feeType: "monthly",
            month
        }).select("student");
        const studentsWithFees = new Set(
            existingMonthlyFees.map((fee) => fee.student.toString())
        );

        for (const student of activeStudents) {
            if (studentsWithFees.has(student._id.toString())) continue;

            await FeePayment.create({
                student: student._id,
                feeType: "monthly",
                amount: 0,
                month,
                paymentDate: new Date(),
                paymentMethod: "cash",
                status: "pending",
                note: "Auto-generated monthly fee. Enter the fee amount when updating this record."
            });
        }
    })();

    try {
        await currentMonthFeeGeneration;
    } finally {
        currentMonthFeeGeneration = null;
    }
}


// Create Fee Payment
async function createFeePayment(req, res) {
    try {
        const {
            student,
            feeType,
            amount,
            month,
            exam,
            paymentDate,
            paymentMethod,
            status,
            note
        } = req.body;

        const studentExists = await Student.findById(student);

        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (feeType === "monthly") {
            if (studentExists.status !== "active") {
                return res.status(400).json({
                    message: "Monthly fee records can only be created for active students."
                });
            }

            const existingMonthlyFee = await FeePayment.findOne({
                student,
                feeType: "monthly",
                month
            });

            if (existingMonthlyFee) {
                return res.status(409).json({
                    message: "A monthly fee record already exists for this student and month. Please update that record instead."
                });
            }
        }

        const feePayment = await FeePayment.create({
            student,
            feeType,
            amount,
            month,
            exam,
            paymentDate,
            paymentMethod,
            status,
            note
        });

await feePayment.populate(
    "student",
    "name fatherName phone rollNo"
);

        return res.status(201).json({
            message: "Fee payment recorded successfully",
            feePayment
        });

    } catch (error) {
        console.error("Create fee payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Fee Payments
async function getFeePayments(req, res) {
    try {
        await ensureCurrentMonthPendingFees();

        const feePayments = await FeePayment.find()
            .populate("student", "name fatherName phone rollNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            feePayments
        });

    } catch (error) {
        console.error("Get fee payments error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Fee Payments of One Student
async function getStudentFeePayments(req, res) {
    try {
        await ensureCurrentMonthPendingFees();

        const feePayments = await FeePayment.find({
            student: req.params.studentId
        })
            .populate("student", "name fatherName phone rollNo")
            .sort({ paymentDate: -1 });

        return res.status(200).json({
            feePayments
        });

    } catch (error) {
        console.error("Get student fee payments error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Fee Payment
async function getFeePaymentById(req, res) {
    try {
        const feePayment = await FeePayment.findById(
            req.params.id
        ).populate("student", "name fatherName phone rollNo");

        if (!feePayment) {
            return res.status(404).json({
                message: "Fee payment not found"
            });
        }

        return res.status(200).json({
            feePayment
        });

    } catch (error) {
        console.error("Get fee payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Fee Payment
async function updateFeePayment(req, res) {
    try {
        const {
            feeType,
            amount,
            month,
            exam,
            paymentDate,
            paymentMethod,
            status,
            note
        } = req.body;

        const updateData = {};

        if (feeType !== undefined) {
            updateData.feeType = feeType;
        }

        if (amount !== undefined) {
            updateData.amount = amount;
        }

        if (month !== undefined) {
            updateData.month = month;
        }

        if (exam !== undefined) {
            updateData.exam = exam;
        }

        if (paymentDate !== undefined) {
            updateData.paymentDate = paymentDate;
        }

        if (paymentMethod !== undefined) {
            updateData.paymentMethod = paymentMethod;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (note !== undefined) {
            updateData.note = note;
        }

        const feePayment = await FeePayment.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("student", "name fatherName phone rollNo");

        if (!feePayment) {
            return res.status(404).json({
                message: "Fee payment not found"
            });
        }

        return res.status(200).json({
            message: "Fee payment updated successfully",
            feePayment
        });

    } catch (error) {
        console.error("Update fee payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createFeePayment,
    getFeePayments,
    getStudentFeePayments,
    getFeePaymentById,
    updateFeePayment
};
