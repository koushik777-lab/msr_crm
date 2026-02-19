const express = require("express");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const {
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  agentBreak,
  agentOffDuty,
} = require("../controllers/agents");

const router = express.Router();

router.get("/agents", getAllAgents);
router.post("/agent", AdminAuthMiddleware, createAgent);
router.put("/agent/:id", AdminAuthMiddleware, updateAgent);
router.delete("/agent/:id", AdminAuthMiddleware, deleteAgent);

router.get("/agent/break", AdminAuthMiddleware, agentBreak);
router.get("/agent/off-duty", AdminAuthMiddleware, agentOffDuty);

module.exports = router;
