const express = require("express");

const router = express.Router();

const likeController = require("../controllers/likeController");

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

router.post(
  "/posts/:postId/like",
  ensureAuth,
  likeController.toggleLike
);

module.exports = router;