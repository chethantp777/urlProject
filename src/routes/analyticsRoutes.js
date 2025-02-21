// src/routes/analyticsRoutes.js
const express = require("express");
const { getUrlAnalytics, getTopicAnalytics, getOverallAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:alias", getUrlAnalytics);
router.get("/topic/:topic", authMiddleware, getTopicAnalytics);
router.get("/overall", authMiddleware, getOverallAnalytics);

module.exports = router;