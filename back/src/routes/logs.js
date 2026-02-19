const express = require("express");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const {
  getAllLogs,
  postLog,
  getLogByAgent,
  getAgentCallStats,
  getCallHistory,
} = require("../controllers/logs");
const router = express.Router();

router.get("/logs/stats", AdminAuthMiddleware, getAgentCallStats);
router.get("/logs", AdminAuthMiddleware, getAllLogs);
router.get("/logs/history", AdminAuthMiddleware, getCallHistory);
router.get("/logs/:id", AdminAuthMiddleware, getLogByAgent);

router.post("/logs", AdminAuthMiddleware, postLog);

module.exports = router;
