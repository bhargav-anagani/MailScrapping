const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        profilePicture: {
            type: String,
        },
        accessToken: {
            type: String, // Gmail API access token
        },
        refreshToken: {
            type: String, // Gmail API refresh token
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
