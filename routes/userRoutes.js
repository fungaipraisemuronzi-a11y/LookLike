const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

const {
  ensureAuth,
} = require("../middleware/authMiddleware");

router.get(
  "/users",
  ensureAuth,
  userController.getUsers
);

router.get(
  "/users/:userId",
  ensureAuth,
  userController.getProfile
);

router.get(
  "/profile/edit",
  ensureAuth,
  userController.getEditProfile
);

router.post(
  "/profile/edit",
  ensureAuth,
  upload.single("profileImage"),
  userController.updateProfile
);

module.exports = router;