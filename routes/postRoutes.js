const express = require("express");

const router = express.Router();

const postController = require("../controllers/postController");
const upload = require("../middleware/uploadMiddleware");

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

router.get(
  "/feed",
  ensureAuth,
  postController.getFeed
);

router.get(
  "/posts/new",
  ensureAuth,
  postController.getCreatePost
);

router.post(
  "/posts",
  ensureAuth,
  upload.single("image"),
  postController.createPost
);

router.post(
  "/posts/:postId/delete",
  ensureAuth,
  postController.deletePost
);

module.exports = router;