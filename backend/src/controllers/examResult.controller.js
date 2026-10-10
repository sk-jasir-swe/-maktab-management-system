const ExamResult = require("../models/examResult.model");
const Exam = require("../models/exam.model");
const Student = require("../models/student.model");


// Create Exam Result
async function createExamResult(req, res) {
    try {
        const {
            exam,
            student,
            subject,
            marks,
            totalMarks,
            grade,
            remarks
        } = req.body;

        const examExists = await Exam.findById(exam);

        if (!examExists) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const studentExists = await Student.findById(student);

        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Marks validation
        if (marks > totalMarks) {
            return res.status(400).json({
                message: "Marks cannot be greater than total marks"
            });
        }

        // Check duplicate result
        const existingResult = await ExamResult.findOne({
            exam,
            student,
            subject
        });

        if (existingResult) {
            return res.status(400).json({
                message: "Result already exists for this student and subject"
            });
        }

        const examResult = await ExamResult.create({
            exam,
            student,
            subject,
            marks,
            totalMarks,
            grade,
            remarks
        });

        await examResult.populate([
            {
                path: "exam",
                select: "name date"
            },
            {
                path: "student",
                select: "name fatherName"
            }
        ]);

        return res.status(201).json({
            message: "Exam result created successfully",
            examResult
        });

    } catch (error) {
        console.error("Create exam result error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get All Exam Results
async function getExamResults(req, res) {
    try {
        const examResults = await ExamResult.find()
            .populate("exam", "name date")
            .populate("student", "name fatherName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            examResults
        });

    } catch (error) {
        console.error("Get exam results error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Results of One Student
async function getStudentExamResults(req, res) {
    try {
        const examResults = await ExamResult.find({
            student: req.params.studentId
        })
            .populate("exam", "name date")
            .populate("student", "name fatherName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            examResults
        });

    } catch (error) {
        console.error("Get student exam results error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Results of One Exam
async function getExamResultsByExam(req, res) {
    try {
        const examResults = await ExamResult.find({
            exam: req.params.examId
        })
            .populate("exam", "name date")
            .populate("student", "name fatherName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            examResults
        });

    } catch (error) {
        console.error("Get exam results by exam error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Get Single Exam Result
async function getExamResultById(req, res) {
    try {
        const examResult = await ExamResult.findById(
            req.params.id
        )
            .populate("exam", "name date")
            .populate("student", "name fatherName");

        if (!examResult) {
            return res.status(404).json({
                message: "Exam result not found"
            });
        }

        return res.status(200).json({
            examResult
        });

    } catch (error) {
        console.error("Get exam result error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Update Exam Result
async function updateExamResult(req, res) {
    try {
        const {
            subject,
            marks,
            totalMarks,
            grade,
            remarks
        } = req.body;

        const existingResult = await ExamResult.findById(
            req.params.id
        );

        if (!existingResult) {
            return res.status(404).json({
                message: "Exam result not found"
            });
        }

        const finalMarks =
            marks !== undefined
                ? marks
                : existingResult.marks;

        const finalTotalMarks =
            totalMarks !== undefined
                ? totalMarks
                : existingResult.totalMarks;

        const finalSubject =
            subject !== undefined
                ? subject
                : existingResult.subject;

        // Marks validation
        if (finalMarks > finalTotalMarks) {
            return res.status(400).json({
                message: "Marks cannot be greater than total marks"
            });
        }

        // Check duplicate result during update
        if (
            subject !== undefined &&
            subject !== existingResult.subject
        ) {
            const duplicateResult = await ExamResult.findOne({
                _id: { $ne: req.params.id },
                exam: existingResult.exam,
                student: existingResult.student,
                subject: finalSubject
            });

            if (duplicateResult) {
                return res.status(400).json({
                    message: "Result already exists for this student and subject"
                });
            }
        }

        const updateData = {};

        if (subject !== undefined) {
            updateData.subject = subject;
        }

        if (marks !== undefined) {
            updateData.marks = marks;
        }

        if (totalMarks !== undefined) {
            updateData.totalMarks = totalMarks;
        }

        if (grade !== undefined) {
            updateData.grade = grade;
        }

        if (remarks !== undefined) {
            updateData.remarks = remarks;
        }

        const examResult = await ExamResult.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("exam", "name date")
            .populate("student", "name fatherName");

        return res.status(200).json({
            message: "Exam result updated successfully",
            examResult
        });

    } catch (error) {
        console.error("Update exam result error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


// Delete Exam Result
async function deleteExamResult(req, res) {
    try {
        const examResult = await ExamResult.findByIdAndDelete(
            req.params.id
        );

        if (!examResult) {
            return res.status(404).json({
                message: "Exam result not found"
            });
        }

        return res.status(200).json({
            message: "Exam result deleted successfully"
        });

    } catch (error) {
        console.error("Delete exam result error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createExamResult,
    getExamResults,
    getStudentExamResults,
    getExamResultsByExam,
    getExamResultById,
    updateExamResult,
    deleteExamResult
};