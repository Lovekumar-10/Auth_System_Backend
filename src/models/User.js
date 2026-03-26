const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // simple index only
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // --- New fields for Delete Account ---
    pendingDeletion: {
      type: Boolean,
      default: false,
    },
    deletionRequestedAt: {
      type: Date,
    },

    passwordChangedAt: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
