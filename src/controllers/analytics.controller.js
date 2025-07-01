const analyticsService = require('../services/analytics.service');

exports.getSummary = async (req, res) => {
    try {
        const summary = await analyticsService.getSummary();
        let data = {
            totalExpenses: summary
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExpensesByCategory = async (req, res) => {
    try {
        const expensesByCategory = await analyticsService.getExpensesByCategory();
        let data = {
            data: expensesByCategory
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExpensesByStatus = async (req, res) => {
    try {
        const expensesByStatus = await analyticsService.getExpensesByStatus();
        let data = {
            data: expensesByStatus
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getApprovalTimes = async (req, res) => {
    try {
        const approvalTimes = await analyticsService.getApprovalTimes();
        let data = {
            data: approvalTimes
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTopSpenders = async (req, res) => {
    try {
        const topSpenders = await analyticsService.getTopSpenders();
        let data = {
            data: topSpenders
        }
         // Sort top spenders by total amount spent in descending order
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
