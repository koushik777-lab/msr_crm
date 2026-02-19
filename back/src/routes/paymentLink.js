const router = require("express").Router();
const { AdminAuthMiddleware } = require("../utils/middlewares");
const {
  createPaymentLink,
  getPaymentLinks,
  getPaymentLinkById,
} = require("../controllers/paymentLink");

router.post("/payment/create", AdminAuthMiddleware, createPaymentLink);
router.get("/payment/link", AdminAuthMiddleware, getPaymentLinks);
router.get("/payment/link/:id", AdminAuthMiddleware, getPaymentLinkById);

module.exports = router;
