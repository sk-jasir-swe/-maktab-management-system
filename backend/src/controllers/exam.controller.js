const Exam = require("../models/exam.model");


// Create Exam
async function createExam(req, res) {
    try {
        const {
            name,
            date,
            description,
            status
        } = req.body;

        const exam = await Exam.create({
            name,
            date,
            description,
            status
        });

        return res.status(201).json({
            message: "Exam created successfully",
            exam
        });

    } catch (error) {
        console.error("Create exam error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Exams
async function getExams(req, res) {
    try {
        const exams = await Exam.find().sort({
            date: 1
        });

        return res.status(200).json({
            exams
        });

    } catch (error) {
        console.error("Get exams error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Exam
async function getExamById(req, res) {
    try {
        const exam = await Exam.findById(
            req.params.id
        );

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            exam
        });

    } catch (error) {
        console.error("Get exam error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Exam
async function updateExam(req, res) {
    try {
        const {
            name,
            date,
            description,
            status
        } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (date !== undefined) {
            updateData.date = date;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            message: "Exam updated successfully",
            exam
        });

    } catch (error) {
        console.error("Update exam error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Delete Exam
async function deleteExam(req, res) {
    try {
        const exam = await Exam.findByIdAndDelete(
            req.params.id
        );

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            message: "Exam deleted successfully"
        });

    } catch (error) {
        console.error("Delete exam error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam
};