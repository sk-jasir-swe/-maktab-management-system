const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const adminRoutes = require("./routes/admin.routes");
const studentRoutes = require("./routes/student.routes");
const admissionRoutes = require("./routes/admission.routes");
const teacherRoutes = require("./routes/teacher.routes");
const salaryPaymentRoutes = require("./routes/salaryPayment.routes");
const feePaymentRoutes = require("./routes/feePayment.routes");
const examRoutes = require("./routes/exam.routes");
const examResultRoutes = require("./routes/examResult.routes");
const noticeRoutes = require("./routes/notice.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();


// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());


// Routes
app.use("/api/admin", adminRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/admissions", admissionRoutes);

app.use("/api/teachers", teacherRoutes);

app.use("/api/salary-payments", salaryPaymentRoutes);

app.use("/api/fee-payments", feePaymentRoutes);

app.use("/api/exams", examRoutes);

app.use("/api/exam-results", examResultRoutes);

app.use("/api/notices", noticeRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportRoutes);

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Maktab Management API is running"
    });
});


// Error Handler
app.use((err, req, res, next) => {
    if (err && err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Image size should be less than 1MB"
            });
        }

        return res.status(400).json({
            message: err.message || "File upload failed"
        });
    }

    if (err) {
        return res.status(400).json({
            message: err.message || "Something went wrong"
        });
    }

    next();
});


module.exports = app;