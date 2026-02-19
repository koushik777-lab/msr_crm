const express = require("express");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const {
  loginAgent,
  getAgentById,
  sendEmailController,
} = require("../controllers/agents");
const router = express.Router();

router.post("/login/agent", loginAgent);
router.get("/agent", AdminAuthMiddleware, getAgentById);

router.post("/agent/service/email", AdminAuthMiddleware, sendEmailController);

module.exports = router;
