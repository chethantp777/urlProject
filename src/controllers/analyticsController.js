// src/controllers/analyticsController.js
const ShortUrl = require("../routes/urlRoutes");
const moment = require("moment");
const redisClient = require("../config/redis");

exports.getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const cacheKey = `analytics:${alias}`;

    // Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    const shortUrl = await ShortUrl.findOne({ alias });
    if (!shortUrl) return res.status(404).json({ message: "URL not found" });
    
    const last7Days = [...Array(7).keys()].map(i => moment().subtract(i, "days").format("YYYY-MM-DD"));
    const clicksByDate = last7Days.map(date => ({
      date,
      clickCount: shortUrl.clicks.filter(c => moment(c.timestamp).format("YYYY-MM-DD") === date).length
    }));

    const osType = shortUrl.clicks.reduce((acc, click) => {
      const os = click.os;
      if (!acc[os]) acc[os] = { osName: os, uniqueClicks: 0, uniqueUsers: new Set() };
      acc[os].uniqueClicks++;
      acc[os].uniqueUsers.add(click.ip);
      return acc;
    }, {});

    const deviceType = shortUrl.clicks.reduce((acc, click) => {
      const device = click.device;
      if (!acc[device]) acc[device] = { deviceName: device, uniqueClicks: 0, uniqueUsers: new Set() };
      acc[device].uniqueClicks++;
      acc[device].uniqueUsers.add(click.ip);
      return acc;
    }, {});
    
    const responseData = { totalClicks: shortUrl.clicks.length,
      uniqueUsers: new Set(shortUrl.clicks.map(c => c.ip)).size, 
      clicksByDate,
      osType: Object.values(osType).map(o => ({
        osName: o.osName,
        uniqueClicks: o.uniqueClicks,
        uniqueUsers: o.uniqueUsers.size
      })),
      deviceType: Object.values(deviceType).map(d => ({
        deviceName: d.deviceName,
        uniqueClicks: d.uniqueClicks,
        uniqueUsers: d.uniqueUsers.size
      }))
    };
    // Store data in Redis cache with expiration
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopicAnalytics = async (req, res) => {

  try {
    const { topic } = req.params;
    const shortUrls = await ShortUrl.find({ topic });
    if (!shortUrls.length) return res.status(404).json({ message: "No URLs found for this topic" });

    let totalClicks = 0;
    let uniqueUsers = new Set();
    let clicksByDate = {};
    let urls = [];

    shortUrls.forEach(url => {
      totalClicks += url.clicks.length;
      url.clicks.forEach(c => uniqueUsers.add(c.ip));
      url.clicks.forEach(c => {
        const date = moment(c.timestamp).format("YYYY-MM-DD");
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });
      urls.push({
        shortUrl: `http://localhost:5000/api/shorten/${url.alias}`,
        totalClicks: url.clicks.length,
        uniqueUsers: new Set(url.clicks.map(c => c.ip)).size
      });
    });

    res.json({
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      clicksByDate: Object.keys(clicksByDate).map(date => ({ date, clickCount: clicksByDate[date] })),
      urls
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOverallAnalytics = async (req, res) => {

  try {
    const userId = req.user.id;
    const shortUrls = await ShortUrl.find({ user: userId });
    if (!shortUrls.length) return res.status(404).json({ message: "No URLs found for this user" });

    let totalUrls = shortUrls.length;
    let totalClicks = 0;
    let uniqueUsers = new Set();
    let clicksByDate = {};
    let osType = {};
    let deviceType = {};

    shortUrls.forEach(url => {
      totalClicks += url.clicks.length;
      url.clicks.forEach(c => uniqueUsers.add(c.ip));
      url.clicks.forEach(c => {
        const date = moment(c.timestamp).format("YYYY-MM-DD");
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
        osType[c.os] = osType[c.os] || { osName: c.os, uniqueClicks: 0, uniqueUsers: new Set() };
        osType[c.os].uniqueClicks++;
        osType[c.os].uniqueUsers.add(c.ip);
        deviceType[c.device] = deviceType[c.device] || { deviceName: c.device, uniqueClicks: 0, uniqueUsers: new Set() };
        deviceType[c.device].uniqueClicks++;
        deviceType[c.device].uniqueUsers.add(c.ip);
      });
    });

    res.json({
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      clicksByDate: Object.keys(clicksByDate).map(date => ({ date, clickCount: clicksByDate[date] })),
      osType: Object.values(osType).map(o => ({ osName: o.osName, uniqueClicks: o.uniqueClicks, uniqueUsers: o.uniqueUsers.size })),
      deviceType: Object.values(deviceType).map(d => ({ deviceName: d.deviceName, uniqueClicks: d.uniqueClicks, uniqueUsers: d.uniqueUsers.size }))
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
