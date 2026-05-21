const mongoose = require("mongoose");

const incidentEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "NO_HELMET",
        "NO_VEST",
        "GAS_ALERT",
        "TEMP_ALERT",
        "FIRE_ALERT",
        "FALL",
        "INJURY",
        "WORK_ACCIDENT",
        "LEAK",
        "MANUAL_REPORT",
        "OTHER",
      ],
      default: "MANUAL_REPORT",
    },

    sourceType: {
      type: String,
      enum: ["camera", "sensor", "manual"],
      required: true,
      default: "manual",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceModel",
    },

    reading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReadingModel",
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },

    evidence: {
      imageUrl: String,
      videoUrl: String,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["open", "reviewed", "in_progress", "closed", "false_positive"],
      default: "open",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: Date,

    resolutionNote: {
      type: String,
      trim: true,
    },

    falsePositiveReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

incidentEventSchema.index({ company: 1, createdAt: -1 });
incidentEventSchema.index({ company: 1, zone: 1, createdAt: -1 });
incidentEventSchema.index({ company: 1, status: 1, severity: 1 });

module.exports = mongoose.model("IncidentEvent", incidentEventSchema);