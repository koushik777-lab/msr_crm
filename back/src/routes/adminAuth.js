const express = require("express");
const {
  login,
  signup,
  adminAndAgentLogin,
  changePassword,
  getAllAdmins,
  getClientSheetVisibility,
  updateClientSheetVisibility,
} = require("../controllers/auth");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const router = express.Router();

// router.post ("/login/admin", login )
router.post("/login/admin", adminAndAgentLogin);
router.post("/signup/admin", signup);
router.post("/change-password", changePassword);
router.get("/login/admins", AdminAuthMiddleware, getAllAdmins);
router.get("/client-sheet-visibility", AdminAuthMiddleware, getClientSheetVisibility);
router.post("/client-sheet-visibility", AdminAuthMiddleware, updateClientSheetVisibility);

module.exports = router;
