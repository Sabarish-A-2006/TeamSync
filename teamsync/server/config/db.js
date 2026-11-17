const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isPlaceholder =
    !uri || uri.includes("<username>") || uri.includes("<password>");

  if (!isPlaceholder) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(
        `⚠️ Could not connect to remote MongoDB (${error.message}). Falling back to in-memory instance for development.`,
      );
    }
  } else {
    console.log(
      "ℹ️ MONGODB_URI is not set or contains placeholder values. Starting in-memory MongoDB for development/testing...",
    );
  }

  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Connected at: ${memoryUri}`);
    process.env.MONGODB_URI = memoryUri;
  } catch (memError) {
    console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
