const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const chatController = require(
  "../controllers/chatController"
);

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      "public/uploads"
    );

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      path.extname(file.originalname)
    );

  },

});

const upload = multer({
  storage,
});

/* =========================
   START CHAT
========================= */

router.get(
  "/chat/user/:userId",
  ensureAuth,
  chatController.startChat
);

/* =========================
   INBOX
========================= */

router.get(
  "/chat",
  ensureAuth,
  chatController.getInbox
);

/* =========================
   OPEN CHAT
========================= */

router.get(
  "/chat/conversation/:conversationId",
  ensureAuth,
  chatController.openChat
);

/* =========================
   SEND MESSAGE
========================= */

router.post(
  "/chat/conversation/:conversationId/message",
  ensureAuth,
  upload.single("image"),
  chatController.sendMessage
);

module.exports = router;