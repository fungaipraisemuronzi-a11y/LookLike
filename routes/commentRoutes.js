const express = require("express");

const router = express.Router();

const commentController = require("../controllers/commentController");

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

router.post(
  "/posts/:postId/comment",
  ensureAuth,
  commentController.createComment
);

module.exports = router;