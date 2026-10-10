const SalaryPayment = require("../models/salaryPayment.model");
const Teacher = require("../models/teacher.model");


// Create Salary Payment
async function createSalaryPayment(req, res) {
    try {
        const {
            teacher,
            amount,
            month,
            paymentDate,
            paymentMethod,
            status,
            note
        } = req.body;

        const teacherExists = await Teacher.findById(teacher);

        if (!teacherExists) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        const salaryPayment = await SalaryPayment.create({
            teacher,
            amount,
            month,
            paymentDate,
            paymentMethod,
            status,
            note
        });

        await salaryPayment.populate(
            "teacher",
            "name subject"
        );

        return res.status(201).json({
            message: "Salary payment recorded successfully",
            salaryPayment
        });

    } catch (error) {
        console.error("Create salary payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Salary Payments
async function getSalaryPayments(req, res) {
    try {
        const salaryPayments = await SalaryPayment.find()
            .populate("teacher", "name subject")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            salaryPayments
        });

    } catch (error) {
        console.error("Get salary payments error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Salary Payments of One Teacher
async function getTeacherSalaryPayments(req, res) {
    try {
        const salaryPayments = await SalaryPayment.find({
            teacher: req.params.teacherId
        })
            .populate("teacher", "name subject")
            .sort({ paymentDate: -1 });

        return res.status(200).json({
            salaryPayments
        });

    } catch (error) {
        console.error("Get teacher salary payments error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Salary Payment
async function getSalaryPaymentById(req, res) {
    try {
        const salaryPayment = await SalaryPayment.findById(
            req.params.id
        ).populate("teacher", "name subject");

        if (!salaryPayment) {
            return res.status(404).json({
                message: "Salary payment not found"
            });
        }

        return res.status(200).json({
            salaryPayment
        });

    } catch (error) {
        console.error("Get salary payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Salary Payment
async function updateSalaryPayment(req, res) {
    try {
        const {
            amount,
            month,
            paymentDate,
            paymentMethod,
            status,
            note
        } = req.body;

        const updateData = {};

        if (amount !== undefined) {
            updateData.amount = amount;
        }

        if (month !== undefined) {
            updateData.month = month;
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

        const salaryPayment = await SalaryPayment.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("teacher", "name subject");

        if (!salaryPayment) {
            return res.status(404).json({
                message: "Salary payment not found"
            });
        }

        return res.status(200).json({
            message: "Salary payment updated successfully",
            salaryPayment
        });

    } catch (error) {
        console.error("Update salary payment error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createSalaryPayment,
    getSalaryPayments,
    getTeacherSalaryPayments,
    getSalaryPaymentById,
    updateSalaryPayment
};