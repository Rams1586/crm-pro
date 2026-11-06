const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB error: ${err.message}`);
    if (process.env.NODE_ENV === "production") process.exit(1);
  }
};

module.exports = connectDB;
