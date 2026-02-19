const express = require("express");
const {
  getAllPaymentHistory,
  createPaymentHistory,
  updatePaymentHistory,
  deletePaymentHistory,
  paymentHistoryDashboard,
} = require("../controllers/paymentHistory");
const { AdminAuthMiddleware } = require("../utils/middlewares");

const router = express.Router();

// Routes with authentication middleware
router.get("/payment-history-dashboard", paymentHistoryDashboard);
router.get("/payment-history", AdminAuthMiddleware, getAllPaymentHistory);
router.post("/payment-history", AdminAuthMiddleware, createPaymentHistory);
router.put("/payment-history/:id", AdminAuthMiddleware, updatePaymentHistory);
router.delete(
  "/payment-history/:id",
  AdminAuthMiddleware,
  deletePaymentHistory,
);

module.exports = router;
