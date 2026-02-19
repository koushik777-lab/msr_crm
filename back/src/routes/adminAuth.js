const express = require("express");
const {
  login,
  signup,
  adminAndAgentLogin,
  changePassword,
  getAllAdmins,
} = require("../controllers/auth");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const router = express.Router();

// router.post ("/login/admin", login )
router.post("/login/admin", adminAndAgentLogin);
router.post("/signup/admin", signup);
router.post("/change-password", changePassword);
router.get("/login/admins", AdminAuthMiddleware, getAllAdmins);

module.exports = router;
