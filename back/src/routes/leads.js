const express = require("express");
const { uploadSingle } = require("../utils/upload");
const {
  getAllLeads,
  postLeads,
  updateLeads,
  deleteLeads,
  getAgentLeads,
  updateLeadStatus,
  multiAssignLeads,
  uploadExcelLeads,
} = require("../controllers/leads");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const router = express.Router();

router.get("/leads", AdminAuthMiddleware, getAllLeads);
router.post("/lead", AdminAuthMiddleware, postLeads);
router.put("/lead/:id", AdminAuthMiddleware, updateLeads);
router.delete("/lead/:id", AdminAuthMiddleware, deleteLeads);

router.get("/agent/leads", AdminAuthMiddleware, getAgentLeads);
router.put("/agent/lead/:id", AdminAuthMiddleware, updateLeadStatus);
router.post("/multiLeads", AdminAuthMiddleware, multiAssignLeads);
router.post(
  "/upload-excel",
  AdminAuthMiddleware,
  uploadSingle("file"),
  uploadExcelLeads,
);

module.exports = router;
