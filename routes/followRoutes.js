const express = require("express");

const router = express.Router();

const followController = require("../controllers/followController");

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

router.post(
  "/users/:userId/follow",
  ensureAuth,
  followController.toggleFollow
);

module.exports = router;