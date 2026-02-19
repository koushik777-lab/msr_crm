const express = require("express");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const {
  getTodaysCall,
  getMonthlyLeads,
  getDashboardData,
} = require("../controllers/dashboard");

const router = express.Router();

router.get("/dashboard", AdminAuthMiddleware, getDashboardData);
router.get("/todays-call", AdminAuthMiddleware, getTodaysCall);
router.get("/monthly-leads", AdminAuthMiddleware, getMonthlyLeads);

module.exports = router;
