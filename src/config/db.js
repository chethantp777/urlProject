const mongoose = require('mongoose');

const connectDB = async () => {
    console.log("MongoDB URI:", process.env.MONGO_URI); // Debugging line

    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing. Check your .env file.");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
