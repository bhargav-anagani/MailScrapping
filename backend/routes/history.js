const express = require("express");
const { protect } = require("../middleware/auth");
const SearchHistory = require("../models/SearchHistory");

const router = express.Router();

// @route   POST /api/history
// @desc    Save a search keyword
// @access  Protected
router.post("/", protect, async (req, res) => {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === "") {
        return res.status(400).json({ message: "Keyword is required" });
    }

    try {
        const entry = await SearchHistory.create({
            userId: req.user._id,
            keyword: keyword.trim(),
        });
        res.status(201).json(entry);
    } catch (error) {
        console.error("Save history error:", error.message);
        res.status(500).json({ message: "Server error saving search history" });
    }
});

// @route   GET /api/history
// @desc    Get user's search history (latest 20)
// @access  Protected
router.get("/", protect, async (req, res) => {
    try {
        const history = await SearchHistory.find({ userId: req.user._id })
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(history);
    } catch (error) {
        console.error("Fetch history error:", error.message);
        res.status(500).json({ message: "Server error fetching search history" });
    }
});

// @route   DELETE /api/history/:id
// @desc    Delete a single history entry
// @access  Protected
router.delete("/:id", protect, async (req, res) => {
    try {
        const entry = await SearchHistory.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!entry) {
            return res.status(404).json({ message: "History entry not found" });
        }

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
