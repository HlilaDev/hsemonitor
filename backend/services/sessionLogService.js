const UAParser = require("ua-parser-js");
const SessionLog = require("../models/sessionLogModel");

function getIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    "Unknown IP"
  )
    .replace("::ffff:", "")
    .replace("::1", "127.0.0.1");
}

function parseDevice(req) {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceTypeRaw = result.device?.type;
  const osName = result.os?.name || "Unknown OS";
  const browserName = result.browser?.name || "Unknown Browser";
  const browserVersion = result.browser?.version || "";

  let deviceType = "desktop";
  let deviceName = "Desktop Device";

  if (deviceTypeRaw === "mobile") {
    deviceType = "mobile";
    deviceName = `${osName} Phone`;
  } else if (deviceTypeRaw === "tablet") {
    deviceType = "tablet";
    deviceName = `${osName} Tablet`;
  } else {
    deviceType = "desktop";

    if (osName.toLowerCase().includes("windows")) {
      deviceName = "Windows Workstation";
    } else if (osName.toLowerCase().includes("mac")) {
      deviceName = "Mac Workstation";
    } else if (osName.toLowerCase().includes("linux")) {
      deviceName = "Linux Workstation";
    } else {
      deviceName = "Desktop Device";
    }
  }

  return {
    deviceName,
    deviceType,
    browser: `${browserName} ${browserVersion}`.trim(),
  };
}

exports.createSessionLog = async ({
  req,
  user,
  status,
  reason = "",
  sessionId = null,
}) => {
  const device = parseDevice(req);

  return SessionLog.create({
    sessionId,
    user: user._id,
    company: user.company?._id || user.company || null,

    deviceName: device.deviceName,
    deviceType: device.deviceType,
    browser: device.browser,

    ipAddress: getIp(req),
    location: "Tunisia",

    status,
    reason,
    loginAt: new Date(),
    lastActivity: new Date(),
  });
};

exports.updateSessionActivity = async (sessionId) => {
  if (!sessionId) return null;

  return SessionLog.findOneAndUpdate(
    { sessionId, status: "success" },
    { lastActivity: new Date() },
    { new: true }
  );
};