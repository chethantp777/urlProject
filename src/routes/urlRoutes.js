// src/routes/urlRoutes.js
const express = require("express");
const { shortenUrl, redirectUrl } = require("../controllers/urlController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, shortenUrl);
router.get("/:alias", redirectUrl);

module.exports = router;