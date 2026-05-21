const IncidentEvent = require("../../models/IncidentEventModel");
const Observation = require("../../models/observationModel");
const Alert = require("../../models/alertModel");
const Zone = require("../../models/zoneModel");

function getCompanyId(user) {
  return user?.company?._id || user?.company || null;
}

function getCurrentWeekRange() {
  const now = new Date();

  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  weekEnd.setMilliseconds(-1);

  return { weekStart, weekEnd };
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item[field] || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function buildAiWeeklyReportData(user) {
  const companyId = getCompanyId(user);

  if (!companyId) {
    throw new Error("Company ID introuvable pour générer le rapport IA.");
  }

  const { weekStart, weekEnd } = getCurrentWeekRange();

  const dateFilter = {
    company: companyId,
    createdAt: {
      $gte: weekStart,
      $lte: weekEnd,
    },
  };

  const [incidents, observations, alerts, zones] = await Promise.all([
    IncidentEvent.find(dateFilter)
      .select("title description type severity status sourceType zone createdAt")
      .populate("zone", "name riskLevel")
      .sort({ createdAt: -1 })
      .lean(),

    Observation.find(dateFilter)
      .select("title description severity status zone createdAt")
      .populate("zone", "name riskLevel")
      .sort({ createdAt: -1 })
      .lean(),

    Alert.find(dateFilter)
      .select("title message type severity status zone readingValue threshold createdAt")
      .populate("zone", "name riskLevel")
      .sort({ createdAt: -1 })
      .lean(),

    Zone.find({ company: companyId })
      .select("name description riskLevel isActive")
      .sort({ name: 1 })
      .lean(),
  ]);

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  const highRiskZones = zones.filter((z) => z.riskLevel === "high");

  const stats = {
    incidentsCount: incidents.length,
    observationsCount: observations.length,
    alertsCount: alerts.length,
    criticalAlertsCount: criticalAlerts.length,
    highRiskZonesCount: highRiskZones.length,

    incidentsBySeverity: countBy(incidents, "severity"),
    observationsBySeverity: countBy(observations, "severity"),
    alertsBySeverity: countBy(alerts, "severity"),

    incidentsByStatus: countBy(incidents, "status"),
    observationsByStatus: countBy(observations, "status"),
    alertsByStatus: countBy(alerts, "status"),
  };

  return {
    companyId,
    weekStart,
    weekEnd,
    stats,
    zones,
    incidents,
    observations,
    alerts,
  };
}

module.exports = {
  getCurrentWeekRange,
  buildAiWeeklyReportData,
};