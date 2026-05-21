const Observation = require("../../models/observationModel");

function getCompanyId(user) {
  return user?.company?._id || user?.company || null;
}

function getWeekRanges() {
  const now = new Date();

  const startThisWeek = new Date(now);
  const day = startThisWeek.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  startThisWeek.setDate(startThisWeek.getDate() + diffToMonday);
  startThisWeek.setHours(0, 0, 0, 0);

  const startLastWeek = new Date(startThisWeek);
  startLastWeek.setDate(startThisWeek.getDate() - 7);

  const endLastWeek = new Date(startThisWeek);
  endLastWeek.setMilliseconds(-1);

  return { now, startThisWeek, startLastWeek, endLastWeek };
}

function calcTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

exports.getObservationStats = async (user) => {
  const companyId = getCompanyId(user);

  const { now, startThisWeek, startLastWeek, endLastWeek } = getWeekRanges();

  const filter =
    user.role === "superAdmin"
      ? {}
      : { company: companyId };

  const openStatuses = ["open", "in_progress", "pending_validation", "reopened"];

  const [
    total,
    openCount,
    resolvedCount,

    thisWeek,
    lastWeek,

    byStatus,
    bySeverity,
    byZone,

    recent,
  ] = await Promise.all([
    Observation.countDocuments(filter),

    Observation.countDocuments({
      ...filter,
      status: { $in: openStatuses },
    }),

    Observation.countDocuments({
      ...filter,
      status: "resolved",
    }),

    Observation.countDocuments({
      ...filter,
      createdAt: { $gte: startThisWeek, $lte: now },
    }),

    Observation.countDocuments({
      ...filter,
      createdAt: { $gte: startLastWeek, $lte: endLastWeek },
    }),

    Observation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    Observation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]),

    Observation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$zone",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "zones",
          localField: "_id",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          zoneId: "$_id",
          zoneName: { $ifNull: ["$zone.name", "Zone non définie"] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),

    Observation.find(filter)
      .populate("zone", "_id name")
      .populate("reportedBy", "_id firstName lastName fullName email")
      .sort("-createdAt")
      .limit(5),
  ]);

  return {
    total,

    open: {
      count: openCount,
      trend: calcTrend(thisWeek, lastWeek),
    },

    resolved: {
      count: resolvedCount,
    },

    weekly: {
      current: thisWeek,
      previous: lastWeek,
    },

    byStatus: byStatus.map(item => ({
      status: item._id || "unknown",
      count: item.count,
    })),

    bySeverity: bySeverity.map(item => ({
      severity: item._id || "unknown",
      count: item.count,
    })),

    byZone,

    recent,
  };
};