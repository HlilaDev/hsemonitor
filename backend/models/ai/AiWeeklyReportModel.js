const mongoose = require("mongoose");

const aiWeeklyReportSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    weekEnd: {
      type: Date,
      required: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "generated", "failed"],
      default: "generated",
    },

    title: {
      type: String,
      default: "Rapport hebdomadaire IA HSE",
      trim: true,
    },

    summary: {
      type: String,
      default: "",
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    stats: {
      incidentsCount: { type: Number, default: 0 },
      observationsCount: { type: Number, default: 0 },
      alertsCount: { type: Number, default: 0 },
      criticalAlertsCount: { type: Number, default: 0 },
      highRiskZonesCount: { type: Number, default: 0 },
    },

    sections: {
      incidents: { type: String, default: "" },
      observations: { type: String, default: "" },
      alerts: { type: String, default: "" },
      zones: { type: String, default: "" },
      trends: { type: String, default: "" },
      causes: { type: String, default: "" },
    },

    recommendations: [
      {
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
        },
        targetZone: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Zone",
          default: null,
        },
      },
    ],

    actionPlan: [
      {
        action: {
          type: String,
          required: true,
          trim: true,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        responsibleRole: {
          type: String,
          enum: ["manager", "supervisor", "agent"],
          default: "supervisor",
        },
        dueDate: {
          type: Date,
          default: null,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "done"],
          default: "pending",
        },
      },
    ],

    aiProvider: {
      type: String,
      default: "gemini",
    },

    exportUrl: {
  type: String,
  default: "",
},

    aiModel: {
      type: String,
      default: "gemini-1.5-flash",
    },

    rawAiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

aiWeeklyReportSchema.index(
  { company: 1, weekStart: 1, weekEnd: 1 },
  { unique: true }
);

module.exports = mongoose.model("AiWeeklyReport", aiWeeklyReportSchema);