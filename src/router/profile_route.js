const express = require("express");
const { createProfile, getProfile } = require("../controller/profile_controller.js");
const { authMiddleware } = require("../middle_ware/auth_middleware.js");

const router = express.Router();

router.post("/", authMiddleware, createProfile);
router.get("/", authMiddleware, getProfile);

module.exports = router;
