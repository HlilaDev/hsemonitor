const SessionLog = require("../models/sessionLogModel");

function formatLog(log, currentSessionId) {
  return {
    _id: log._id,
    sessionId: log.sessionId,

    user: log.user,
    company: log.company,

    deviceName: log.deviceName || "Unknown Device",
    deviceType: log.deviceType || "desktop",
    browser: log.browser || "Unknown Browser",
    ipAddress: log.ipAddress || "Unknown IP",
    location: log.location || "Unknown location",

    status: log.status,
    reason: log.reason || "",

    loginAt: log.loginAt,
    lastActivity: log.lastActivity,

    current:
      Boolean(currentSessionId) &&
      Boolean(log.sessionId) &&
      log.sessionId === currentSessionId &&
      log.status === "success",
  };
}

// GET /api/session-logs/me
exports.getMySessionLogs = async (req, res) => {
  try {
    const logs = await SessionLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedLogs = logs.map((log) => formatLog(log, req.sessionId));

    return res.status(200).json({ logs: formattedLogs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/session-logs
exports.getCompanySessionLogs = async (req, res) => {
  try {
    const query = {};

    if (req.user.role !== "superAdmin") {
      query.company = req.user.company?._id || req.user.company;
    }

    const logs = await SessionLog.find(query)
      .populate("user", "firstName lastName email role")
      .populate("company", "_id name industry")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formattedLogs = logs.map((log) => formatLog(log, req.sessionId));

    return res.status(200).json({ logs: formattedLogs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};