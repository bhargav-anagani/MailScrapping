const Redis = require("ioredis");

// Provide a fallback for local development if REDIS_URL is not set
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(redisUrl, {
    retryStrategy(times) {
        // Reconnect after
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
    console.log("🟢 Connected to Redis successfully.");
});

redisClient.on("error", (err) => {
    console.error("🔴 Redis connection error:", err.message);
});

module.exports = redisClient;
