// src/controllers/urlController.js
const ShortUrl = require("../routes/urlRoutes");
const redisClient = require("../config/redis");
const crypto = require("crypto");

exports.shortenUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.userId;
    let alias = customAlias || crypto.randomBytes(4).toString("hex");
    let existingUrl = await ShortUrl.findOne({ alias });
    if (existingUrl && !customAlias) {
      return res.status(400).json({ message: "Alias already taken" });
    }
    const shortUrl = new ShortUrl({ longUrl, alias, topic, userId });
    await shortUrl.save();
    res.json({ shortUrl: `http://localhost:5000/api/shorten/${alias}`, createdAt: shortUrl.createdAt });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    const cachedUrl = await redisClient.get(alias);
    if (cachedUrl) return res.redirect(cachedUrl);
    const shortUrl = await ShortUrl.findOne({ alias });
    if (!shortUrl) return res.status(404).json({ message: "URL not found" });
    await redisClient.setEx(alias, 3600, shortUrl.longUrl);
    res.redirect(shortUrl.longUrl);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};