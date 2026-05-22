const express = require("express");
const router = express.Router();
const MasterSheet = require("../models/MasterSheet");
const QcciUgac = require("../models/QcciUgac");
const QcciWaf = require("../models/QcciWaf");
const MasterSheetFinal = require("../models/MasterSheetFinal");
const { AdminAuthMiddleware } = require("../utils/middlewares");

const models = {
    draft: MasterSheet,
    qcci_ugac: QcciUgac,
    qcci_waf: QcciWaf,
    master_final: MasterSheetFinal
};

// Helper function to safely fetch next serial number for any model
async function getNextSNo(Model) {
    const lastRecord = await Model.findOne().sort({ "S_ NO": -1 });
    return lastRecord && lastRecord["S_ NO"] ? lastRecord["S_ NO"] + 1 : 1;
}

// Helper to look up a record by _id across all 4 collections (returns most specific first)
async function findRecordById(id) {
    const recordUgac = await QcciUgac.findById(id);
    if (recordUgac) return { record: recordUgac, type: "qcci_ugac", Model: QcciUgac };

    const recordWaf = await QcciWaf.findById(id);
    if (recordWaf) return { record: recordWaf, type: "qcci_waf", Model: QcciWaf };

    const recordDraft = await MasterSheet.findById(id);
    if (recordDraft) return { record: recordDraft, type: "draft", Model: MasterSheet };

    const recordFinal = await MasterSheetFinal.findById(id);
    if (recordFinal) return { record: recordFinal, type: "master_final", Model: MasterSheetFinal };

    return null;
}

// Central helper to create a record in all required collections and return the most specific type
async function createRecordInTargetCollections(data) {
    const certificateNo = data.certificateNo;
    const accreditationBody = data.accreditationBody;
    const certificationBody = data.certificationBody;

    const shouldBeInDraft = !certificateNo || certificateNo.trim() === "";
    const shouldBeInQcciUgac = !shouldBeInDraft && (accreditationBody === "QCCI" && certificationBody === "UGAC");
    const shouldBeInQcciWaf = !shouldBeInDraft && (accreditationBody === "QCCI" && certificationBody === "WAF");

    // Must always save a copy to MasterSheetFinal (MASTER SHEET)
    const sNoMaster = await getNextSNo(MasterSheetFinal);
    const newMasterRecord = new MasterSheetFinal({ ...data, "S_ NO": sNoMaster });
    const savedRecord = await newMasterRecord.save();
    const recordId = savedRecord._id;

    let mostSpecificType = "master_final";

    if (shouldBeInDraft) {
        const sNoDraft = await getNextSNo(MasterSheet);
        const newDraftRecord = new MasterSheet({
            ...data,
            _id: recordId,
            "S_ NO": sNoDraft
        });
        await newDraftRecord.save();
        mostSpecificType = "draft";
    } else {
        if (shouldBeInQcciUgac) {
            const sNoUgac = await getNextSNo(QcciUgac);
            const newUgacRecord = new QcciUgac({
                ...data,
                _id: recordId,
                "S_ NO": sNoUgac
            });
            await newUgacRecord.save();
            mostSpecificType = "qcci_ugac";
        } else if (shouldBeInQcciWaf) {
            const sNoWaf = await getNextSNo(QcciWaf);
            const newWafRecord = new QcciWaf({
                ...data,
                _id: recordId,
                "S_ NO": sNoWaf
            });
            await newWafRecord.save();
            mostSpecificType = "qcci_waf";
        }
    }

    return { record: savedRecord, type: mostSpecificType };
}

// Get all records with pagination, search, and sort for a specific table type
router.get("/master-sheet", AdminAuthMiddleware, async (req, res) => {
    try {
        const type = req.query.type || "draft";
        const Model = models[type] || MasterSheet;

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

        const totalCount = await Model.countDocuments(query);
        const records = await Model.find(query)
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

// Create a new record (Admin Side) with copy-saving and auto-routing logic
router.post("/master-sheet", AdminAuthMiddleware, async (req, res) => {
    try {
        const { record, type } = await createRecordInTargetCollections(req.body);
        res.status(201).json({ message: "Record created successfully", data: record, type });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Create a new record from public form (no auth) with copy-saving and auto-routing logic
router.post("/master-sheet/public", async (req, res) => {
    try {
        const { record, type } = await createRecordInTargetCollections(req.body);
        res.status(201).json({ message: "Record created successfully", data: record, type });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Get a single record from any table
router.get("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        const found = await findRecordById(req.params.id);
        if (!found) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ data: found.record, type: found.type });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Update a record and dynamically synchronize all collections (move/add/delete copy)
router.put("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        const certificateNo = req.body.certificateNo;
        const accreditationBody = req.body.accreditationBody;
        const certificationBody = req.body.certificationBody;

        const shouldBeInDraft = !certificateNo || certificateNo.trim() === "";
        const shouldBeInQcciUgac = !shouldBeInDraft && (accreditationBody === "QCCI" && certificationBody === "UGAC");
        const shouldBeInQcciWaf = !shouldBeInDraft && (accreditationBody === "QCCI" && certificationBody === "WAF");

        // Verify existing presence in lightweight exists checks
        const existsInDraft = await MasterSheet.exists({ _id: req.params.id });
        const existsInMasterFinal = await MasterSheetFinal.exists({ _id: req.params.id });
        const existsInQcciUgac = await QcciUgac.exists({ _id: req.params.id });
        const existsInQcciWaf = await QcciWaf.exists({ _id: req.params.id });

        // 1. Sync MASTER SHEET Final Collection (Always present!)
        if (existsInMasterFinal) {
            await MasterSheetFinal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        } else {
            const sNo = await getNextSNo(MasterSheetFinal);
            const newRecord = new MasterSheetFinal({ ...req.body, _id: req.params.id, "S_ NO": sNo });
            await newRecord.save();
        }

        // 2. Sync DRAFT Collection
        if (shouldBeInDraft) {
            if (existsInDraft) {
                await MasterSheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
            } else {
                const sNo = await getNextSNo(MasterSheet);
                const newRecord = new MasterSheet({ ...req.body, _id: req.params.id, "S_ NO": sNo });
                await newRecord.save();
            }
        } else {
            if (existsInDraft) {
                await MasterSheet.findByIdAndDelete(req.params.id);
            }
        }

        // 3. Sync QCCI(UGAC) Collection
        if (shouldBeInQcciUgac) {
            if (existsInQcciUgac) {
                await QcciUgac.findByIdAndUpdate(req.params.id, req.body, { new: true });
            } else {
                const sNo = await getNextSNo(QcciUgac);
                const newRecord = new QcciUgac({ ...req.body, _id: req.params.id, "S_ NO": sNo });
                await newRecord.save();
            }
        } else {
            if (existsInQcciUgac) {
                await QcciUgac.findByIdAndDelete(req.params.id);
            }
        }

        // 4. Sync QCCI(WAF) Collection
        if (shouldBeInQcciWaf) {
            if (existsInQcciWaf) {
                await QcciWaf.findByIdAndUpdate(req.params.id, req.body, { new: true });
            } else {
                const sNo = await getNextSNo(QcciWaf);
                const newRecord = new QcciWaf({ ...req.body, _id: req.params.id, "S_ NO": sNo });
                await newRecord.save();
            }
        } else {
            if (existsInQcciWaf) {
                await QcciWaf.findByIdAndDelete(req.params.id);
            }
        }

        // Determine most specific type to return for frontend navigation
        let mostSpecificType = "master_final";
        if (shouldBeInDraft) mostSpecificType = "draft";
        else if (shouldBeInQcciUgac) mostSpecificType = "qcci_ugac";
        else if (shouldBeInQcciWaf) mostSpecificType = "qcci_waf";

        const finalFound = await findRecordById(req.params.id);

        res.status(200).json({
            message: "Record updated and synchronized successfully",
            data: finalFound ? finalFound.record : req.body,
            type: mostSpecificType
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Delete a record from all tables where it might exist
router.delete("/master-sheet/:id", AdminAuthMiddleware, async (req, res) => {
    try {
        await MasterSheet.findByIdAndDelete(req.params.id);
        await QcciUgac.findByIdAndDelete(req.params.id);
        await QcciWaf.findByIdAndDelete(req.params.id);
        await MasterSheetFinal.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
