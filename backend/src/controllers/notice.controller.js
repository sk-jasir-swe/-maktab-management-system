const Notice = require("../models/notice.model");

// Create Notice
async function createNotice(req, res) {
    try {
        const { title, description, date, status } = req.body;

        const notice = await Notice.create({
            title,
            description,
            date,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Notice created successfully",
            notice
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get All Active Notices — Latest Published First
async function getNotices(req, res) {
    try {
        const notices = await Notice.find({
            status: "active"
        }).sort({
            createdAt: -1,
            _id: -1
        });

        return res.status(200).json({
            success: true,
            message: "Active notices fetched successfully",
            notices
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get Single Notice by ID
async function getNoticeById(req, res) {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notice fetched successfully",
            notice
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Update Notice
async function updateNotice(req, res) {
    try {
        const { id } = req.params;

        const notice = await Notice.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notice updated successfully",
            notice
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Delete Notice
async function deleteNotice(req, res) {
    try {
        const { id } = req.params;

        const notice = await Notice.findByIdAndDelete(id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notice deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    createNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice
};