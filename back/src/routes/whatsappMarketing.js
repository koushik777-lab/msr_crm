const express = require("express");
const {
  sendWhatsAppMessage,
  recieveWhatsappMessage,
  getWhatsappContacts,
  getAllChats,
  assignDifferentAgent,
} = require("../controllers/whatsapp");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const router = express.Router();

router.post("/whatsappMessage", sendWhatsAppMessage);
router.post("/recieveMessage", recieveWhatsappMessage); //recieve payload from whatsapp webhook
router.get("/whatsappContacts", AdminAuthMiddleware, getWhatsappContacts);
router.get("/whatsappChats/:contactId", AdminAuthMiddleware, getAllChats);
router.post("/Whatsapp/assignAgent", AdminAuthMiddleware, assignDifferentAgent);

module.exports = router;
