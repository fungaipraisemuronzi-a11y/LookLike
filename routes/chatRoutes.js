const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const { ensureAuth } = require("../middleware/authMiddleware");

/*
========================
INBOX
========================
*/
router.get("/chat", ensureAuth, chatController.getInbox);

/*
========================
START / OPEN CHAT WITH USER
========================
*/
router.get(
  "/chat/user/:userId",
  ensureAuth,
  chatController.startChat
);

/*
========================
OPEN CONVERSATION
========================
*/
router.get(
  "/chat/conversation/:conversationId",
  ensureAuth,
  chatController.openChat
);

/*
========================
SEND MESSAGE
========================
*/
router.post(
  "/chat/conversation/:conversationId/message",
  ensureAuth,
  chatController.sendMessage
);

module.exports = router;