const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    domain: {
        type: String,
        required: true,
        index: true,
    },
    source: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "active",
    },
    scrapedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Email", EmailSchema);
