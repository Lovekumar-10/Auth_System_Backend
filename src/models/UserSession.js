

const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    jti: {
      type: String,
      required: true,
      index: true,
    },

    device: {
      type: String,
      default: "Unknown Device",
    },

    ip: {
      type: String,
    },    
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 TTL INDEX (AUTO DELETE AFTER EXPIRY)
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("UserSession", userSessionSchema);
