const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
        ],
        accessType: "offline",
        prompt: "consent select_account",
    })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed`, session: false }),
    (req, res) => {
        const token = generateToken(req.user._id);
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    }
);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Protected
router.get("/me", protect, (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
    });
});

// @route   GET /api/auth/logout
// @desc    Logout user (client-side clears token)
router.get("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

module.exports = router;
