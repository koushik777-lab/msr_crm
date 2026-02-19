const express = require("express");
const { uploadMultiple } = require("../utils/upload");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const { startMarketingEmails } = require("../controllers/email");
const router = express.Router();

router.post(
  "/marketing",
  AdminAuthMiddleware,
  uploadMultiple("attachedFiles", 5),
  startMarketingEmails,
);

module.exports = router;
