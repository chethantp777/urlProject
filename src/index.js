const express = require("express");
const connectDB = require("./config/db");
const redisClient = require("./config/redis");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shorten", urlRoutes);
app.use("/api/analytics", analyticsRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
