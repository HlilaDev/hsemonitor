const mongoose = require("mongoose");

const sessionLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      index: true,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
    },

    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },

    browser: {
      type: String,
      default: "Unknown Browser",
    },

    ipAddress: {
      type: String,
      default: "Unknown IP",
    },

    location: {
      type: String,
      default: "Unknown location",
    },

    status: {
      type: String,
      enum: ["success", "failed", "expired"],
      required: true,
      index: true,
    },

    reason: {
      type: String,
      default: "",
    },

    loginAt: {
      type: Date,
      default: Date.now,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionLog", sessionLogSchema);