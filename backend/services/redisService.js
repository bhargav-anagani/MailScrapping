const redisClient = require("../config/redisClient");
const Email = require("../models/Email");

const REDIS_KEYS = {
    EMAILS_SET: "emails:set",
    QUEUE: "scrape:queue",
    VISITED: "scrape:visited",
};

/**
 * Ensures an email is only processed/stored once via Redis Sets and Mongoose fallback.
 * Stores domains in separate Redis Sets.
 * Stores email metadata in Redis Hashes.
 */
exports.saveEmail = async (emailAddress, domain, metadata = {}) => {
    try {
        // 1. Email Deduplication (Primary Index)
        const isMember = await redisClient.sismember(REDIS_KEYS.EMAILS_SET, emailAddress);

        if (isMember) {
            return { saved: false, reason: "Already exists in Redis" };
        }

        // 2. Fallback check in DB (in case Redis was flushed but DB persists)
        const existingEmail = await Email.findOne({ email: emailAddress });
        if (existingEmail) {
            // Re-sync Redis since it was missing
            await redisClient.sadd(REDIS_KEYS.EMAILS_SET, emailAddress);
            return { saved: false, reason: "Already exists in DB (re-synced to Redis)" };
        }

        // 3. Save to MongoDB First (Persistent Store)
        const newEmail = new Email({
            email: emailAddress,
            domain,
            source: metadata.source || "scraper",
            status: metadata.status || "active",
        });
        await newEmail.save();

        // 4. Update Redis Stores
        // Add to global set
        await redisClient.sadd(REDIS_KEYS.EMAILS_SET, emailAddress);
        
        // Add to Domain-Based Indexing set
        if (domain) {
            await redisClient.sadd(`domain:${domain}`, emailAddress);
        }

        // Metadata Storage (Hash)
        await redisClient.hset(
            `email:${emailAddress}`,
            "source", metadata.source || "scraper",
            "status", metadata.status || "active",
            "timestamp", new Date().toISOString()
        );

        return { saved: true, data: newEmail };
    } catch (error) {
        console.error(`Error saving email ${emailAddress}:`, error.message);
        throw error;
    }
};

/**
 * Enqueue a URL for scraping if it hasn't been visited yet.
 */
exports.enqueueUrl = async (url) => {
    try {
        // Deduplicate URLs before queuing
        const isVisited = await redisClient.sismember(REDIS_KEYS.VISITED, url);
        if (isVisited) {
            return { enqueued: false, reason: "Already visited" };
        }

        // Add to visited set immediately
        await redisClient.sadd(REDIS_KEYS.VISITED, url);
        
        // Push to the queue
        await redisClient.lpush(REDIS_KEYS.QUEUE, url);
        return { enqueued: true };
    } catch (error) {
        console.error("Error enqueuing URL:", error.message);
        throw error;
    }
};

/**
 * Wait and pop a URL from the queue (Blocking Pop).
 */
exports.dequeueUrl = async () => {
    try {
        // Block for up to 5 seconds to get an item from the queue
        const result = await redisClient.brpop(REDIS_KEYS.QUEUE, 5);
        if (result) {
            return result[1]; // result is [queueName, value]
        }
        return null;
    } catch (error) {
        console.error("Error dequeuing URL:", error.message);
        return null;
    }
};

/**
 * Fetch all extracted emails by domain from Redis.
 */
exports.getEmailsByDomain = async (domain) => {
    try {
        const emails = await redisClient.smembers(`domain:${domain}`);
        return emails;
    } catch (error) {
        console.error(`Error fetching emails for domain ${domain}:`, error.message);
        throw error;
    }
};

/**
 * Get current length of the scraping queue
 */
exports.getQueueLength = async () => {
    try {
        const length = await redisClient.llen(REDIS_KEYS.QUEUE);
        return length;
    } catch (error) {
        console.error("Error fetching queue length:", error.message);
        // Fallback or rethrow
        return 0;
    }
};
