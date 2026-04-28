const express = require("express");
const router = express.Router();
const MasterSheet = require("../models/MasterSheet");
const { AdminAuthMiddleware } = require("../utils/middlewares");

// Get all records with pagination, search, and sort
router.get("/master-sheet", AdminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const query = {
            $or: [
                { companyName: { $regex: search, $options: "i" } },
                { certificateNo: { $regex: search, $options: "i" } },
                { contactPerson: { $regex: search, $options: "i" } },
            ],
        };

        const totalCount = await MasterSheet.countDocuments(query);
        const records = await MasterSheet.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            message: "Successfully fetched",
            records,
            totalCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Create a new record (Admin Side)
router.post("/master-sheet", AdminAuthMiddleware, async (req, res) => {
    try {
        const lastRecord = await MasterSheet.findOne().sort({ "S_ NO": -1 });
        const nextSNo = lastRecord && lastRecord["S_ NO"] ? lastRecord["S_ NO"] + 1 : 1;

        const newRecord = new MasterSheet({
            ...req.body,
            "S_ NO": nextSNo,
        });

        await newRecord.save();
        res.status(201).json({ message: "Record created successfully", data: newRecord });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Create a new record from public form (no auth)
router.post("/master-sheet/public", async (req, res) => {
    try {
        const lastRecord = await MasterSheet.findOne().sort({ "S_ NO": -1 });
        const nextSNo = lastRecord && lastRecord["S_ NO"] ? lastRecord["S_ NO"] + 1 : 1;

        const newRecord = new MasterSheet({
            ...req.body,
            "S_ NO": nextSNo,
        });

        await newRecord.save();
        res.status(201).json({ message: "Record created successfully", data: newRecord });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Get a single record
router.get("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        const record = await MasterSheet.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ data: record });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Update a record
router.put("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        const updatedRecord = await MasterSheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecord) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Record updated successfully", data: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Delete a record
router.delete("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        const deletedRecord = await MasterSheet.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
