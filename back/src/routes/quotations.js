const express = require("express");
const {
  getquotationNumber,
  addQuotation,
  getCountOfQuotations,
  getAllQuotations,
  updateQuotation,
  updateQuotationNew,
  bulkTransferQuotations,
  quotationNotification,
} = require("../controllers/quotation");
const { AdminAuthMiddleware } = require("../utils/middlewares");

const router = express.Router();
router.get("/quotations", AdminAuthMiddleware, getAllQuotations);
router.post(
  "/quotations/bulk-transfer",
  AdminAuthMiddleware,
  bulkTransferQuotations,
);

router.get("/quotationNumber", AdminAuthMiddleware, getquotationNumber);
router.get("/quotationsCount", AdminAuthMiddleware, getCountOfQuotations);
router.post("/quotation", AdminAuthMiddleware, addQuotation);
router.put("/quotation", AdminAuthMiddleware, updateQuotationNew);
router.put("/quotation/:id", AdminAuthMiddleware, updateQuotation);
router.post("/quotationNotification", quotationNotification);

module.exports = router;
