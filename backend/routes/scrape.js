const express = require("express");
const router = express.Router();
const redisService = require("../services/redisService");

// @route   POST /api/scrape/enqueue
// @desc    Push a single URL or multiple URLs into the Redis queue
router.post("/enqueue", async (req, res) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ message: "Please provide an array of URLs" });
    }

    try {
        const results = [];
        for (const url of urls) {
            const status = await redisService.enqueueUrl(url);
            results.push({ url, ...status });
        }
        res.json({ success: true, results });
    } catch (error) {
        console.error("Enqueue error:", error.message);
        res.status(500).json({ message: "Failed to enqueue URLs" });
    }
});

// @route   GET /api/scrape/emails/domain/:domain
// @desc    Fetch emails by domain from Redis
router.get("/emails/domain/:domain", async (req, res) => {
    const { domain } = req.params;

    if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
    }

    try {
        const emails = await redisService.getEmailsByDomain(domain);
        res.json({ success: true, domain, emails, total: emails.length });
    } catch (error) {
        console.error("Fetch domain emails error:", error.message);
        res.status(500).json({ message: "Failed to fetch emails for this domain" });
    }
});

// @route   GET /api/scrape/queue/status
// @desc    Show current queue length
router.get("/queue/status", async (req, res) => {
    try {
        const count = await redisService.getQueueLength();
        res.json({ success: true, queuedUrls: count });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve queue status" });
    }
});

module.exports = router;
