const IncidentEvent = require("../../models/IncidentEventModel");
const Zone = require("../../models/zoneModel");

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
  startLastWeek.setDate(startLastWeek.getDate() - 7);

  const endLastWeek = new Date(startThisWeek);
  endLastWeek.setMilliseconds(-1);

  return { now, startThisWeek, startLastWeek, endLastWeek };
}

function calcTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getZoneIds(companyId) {
  if (!companyId) return [];
  const zones = await Zone.find({ company: companyId }).select("_id");
  return zones.map(z => z._id);
}

exports.getIncidentStats = async (user) => {
  const companyId = getCompanyId(user);

  const { now, startThisWeek, startLastWeek, endLastWeek } = getWeekRanges();

  const zoneIds = await getZoneIds(companyId);

  // 🔐 multi-tenant filter
  const filter =
    user.role === "superAdmin"
      ? {}
      : { zone: { $in: zoneIds } };

  const [
    total,
    openCount,
    closedCount,

    thisWeek,
    lastWeek,

    bySeverity,
    byStatus,
    byZone,

    recent,
  ] = await Promise.all([
    // total
    IncidentEvent.countDocuments(filter),

    // open
    IncidentEvent.countDocuments({
      ...filter,
      status: "open",
    }),

    // closed
    IncidentEvent.countDocuments({
      ...filter,
      status: "closed",
    }),

    // this week
    IncidentEvent.countDocuments({
      ...filter,
      createdAt: { $gte: startThisWeek, $lte: now },
    }),

    // last week
    IncidentEvent.countDocuments({
      ...filter,
      createdAt: { $gte: startLastWeek, $lte: endLastWeek },
    }),

    // by severity
    IncidentEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]),

    // by status
    IncidentEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // by zone
    IncidentEvent.aggregate([
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
      { $unwind: "$zone" },
      {
        $project: {
          _id: 0,
          zoneId: "$zone._id",
          zoneName: "$zone.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),

    // recent
    IncidentEvent.find(filter)
      .populate("zone", "_id name")
      .populate("device", "_id name")
      .sort("-createdAt")
      .limit(5),
  ]);

  return {
    total,

    open: {
      count: openCount,
      trend: calcTrend(thisWeek, lastWeek),
    },

    closed: {
      count: closedCount,
    },

    weekly: {
      current: thisWeek,
      previous: lastWeek,
    },

    bySeverity: bySeverity.map(item => ({
      severity: item._id,
      count: item.count,
    })),

    byStatus: byStatus.map(item => ({
      status: item._id,
      count: item.count,
    })),

    byZone,

    recent,
  };
};