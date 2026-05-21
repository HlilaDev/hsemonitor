const Alert = require("../models/alertModel");
const AlertRule = require("../models/alertRuleModel");
const Notification = require("../models/notificationModel");
const UserNotification = require("../models/UserNotificationModel");
const User = require("../models/userModel");
const { getIo } = require("../socket/socket");

function compareValue(value, operator, threshold) {
  switch (operator) {
    case ">": return value > threshold;
    case ">=": return value >= threshold;
    case "<": return value < threshold;
    case "<=": return value <= threshold;
    case "==": return value === threshold;
    case "!=": return value !== threshold;
    default: return false;
  }
}

async function findApplicableRules({ metric, deviceId, zoneId, sensorId }) {
  const rules = await AlertRule.find({
    isActive: true,
    metric,
  }).sort({ createdAt: -1 });

  return rules.filter((rule) => {
    const matchDevice = !rule.device || String(rule.device) === String(deviceId || "");
    const matchZone = !rule.zone || String(rule.zone) === String(zoneId || "");
    const matchSensor = !rule.sensor || String(rule.sensor) === String(sensorId || "");

    return matchDevice && matchZone && matchSensor;
  });
}

async function shouldSkipByCooldown(existingAlert, cooldownSec) {
  if (!existingAlert) return false;
  if (!cooldownSec || cooldownSec <= 0) return false;

  const diffSec = Math.floor((Date.now() - new Date(existingAlert.createdAt).getTime()) / 1000);
  return diffSec < cooldownSec;
}

async function getNotificationRecipients(companyId) {
  if (!companyId) return [];

  const users = await User.find({
    company: companyId,
    role: { $in: ["admin", "manager", "supervisor"] },
  }).select("_id");

  return users.map((u) => u._id);
}

async function createAlertNotification(alert, rule, device, zone, sensor) {
  const companyId = device?.company?._id || device?.company;
  if (!companyId) return;

  const recipientIds = await getNotificationRecipients(companyId);
  if (!recipientIds.length) return;

  const notification = await Notification.create({
    company: companyId,
    title: alert.title,
    message: alert.message,
    type: "alert",
    action: "threshold_breach",
    severity: alert.severity,
    alert: alert._id,
    device: device?._id || null,
    zone: zone || null,
    rule: rule?._id || null,
    meta: {
      metric: rule.metric,
      operator: rule.operator,
      threshold: rule.threshold,
      readingValue: alert.readingValue,
      sensor: sensor || null,
    },
  });

  const rows = recipientIds.map((userId) => ({
    notification: notification._id,
    user: userId,
    company: companyId,
    isRead: false,
    isDeleted: false,
  }));

  const insertedRows = await UserNotification.insertMany(rows, {
    ordered: false,
  });

  const io = getIo();

  if (io) {
    const fullRows = await UserNotification.find({
      _id: { $in: insertedRows.map((r) => r._id) },
    })
      .populate({
        path: "notification",
        populate: [
          { path: "zone", select: "_id name code" },
          { path: "device", select: "_id name deviceId status" },
          { path: "alert", select: "_id title severity status" },
          { path: "rule", select: "_id name metric operator threshold severity" },
        ],
      })
      .populate("user", "_id firstName lastName email role");

    for (const row of fullRows) {
      io.to(`user:${row.user._id}`).emit("notification:new", row);
    }
  }
}

async function emitNewAlert(alertId) {
  try {
    const io = getIo();
    if (!io) return;

    const populatedAlert = await Alert.findById(alertId)
      .populate("zone", "_id name")
      .populate("device", "_id name deviceId status")
      .populate("sensor", "_id name type")
      .populate("rule", "_id name metric operator threshold severity");

    if (!populatedAlert) return;

    io.emit("alert:new", populatedAlert);
  } catch (error) {
    console.error("❌ Socket emit alert:new failed:", error.message);
  }
}

async function evaluateMetric({ metric, value, device, zone, sensor }) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return [];
  }

  const numericValue = Number(value);

  const rules = await findApplicableRules({
    metric,
    deviceId: device?._id,
    zoneId: zone,
    sensorId: sensor,
  });

  const triggeredAlerts = [];

  for (const rule of rules) {
    const matched = compareValue(numericValue, rule.operator, rule.threshold);
    if (!matched) continue;

    const existingOpenAlert = await Alert.findOne({
      rule: rule._id,
      device: device?._id || undefined,
      zone: zone || undefined,
      sensor: sensor || undefined,
      status: { $in: ["open", "acknowledged"] },
    }).sort({ createdAt: -1 });

    const cooldownBlocked = await shouldSkipByCooldown(existingOpenAlert, rule.cooldownSec);

    if (cooldownBlocked || existingOpenAlert) {
      triggeredAlerts.push(existingOpenAlert);
      continue;
    }

    const alert = await Alert.create({
      type: "threshold_breach",
      title: `${metric} threshold exceeded`,
      message: `${metric} value ${numericValue} crossed threshold ${rule.threshold}`,
      severity: rule.severity,
      zone: zone || undefined,
      device: device?._id || undefined,
      sensor: sensor || undefined,
      rule: rule._id,
      readingValue: numericValue,
      threshold: rule.threshold,
      status: "open",
      isRead: false,
    });

    await emitNewAlert(alert._id);
    await createAlertNotification(alert, rule, device, zone, sensor);

    triggeredAlerts.push(alert);
  }

  return triggeredAlerts;
}

async function evaluateValues({ values, device, zone, sensor }) {
  if (!values || typeof values !== "object") return [];

  const allAlerts = [];

  for (const [metric, value] of Object.entries(values)) {
    const alerts = await evaluateMetric({
      metric,
      value,
      device,
      zone,
      sensor,
    });

    if (alerts.length) allAlerts.push(...alerts);
  }

  return allAlerts;
}

module.exports = {
  compareValue,
  evaluateMetric,
  evaluateValues,
};