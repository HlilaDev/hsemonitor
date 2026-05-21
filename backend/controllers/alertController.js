//SAAS ok
const Alert = require("../models/alertModel");

// Helper SaaS multi-tenant
const getCompanyFilter = (req) => {
  if (req.user?.role === "superAdmin") {
    return {};
  }

  return {
    company: req.user.company,
  };
};

// GET /api/alerts
exports.listAlerts = async (req, res) => {
  try {
    const {
      status,
      severity,
      zone,
      device,
      type,
      isRead,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const filter = {
      ...getCompanyFilter(req),
    };

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (zone) filter.zone = zone;
    if (device) filter.device = device;
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Alert.find(filter)
        .populate("zone", "_id name")
        .populate("device", "_id name deviceId status")
        .populate("sensor", "_id name type")
        .populate("rule", "_id name metric operator threshold severity")
        .populate("acknowledgedBy", "_id firstName lastName email")
        .populate("resolvedBy", "_id firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(safeLimit),

      Alert.countDocuments(filter),
    ]);

    res.json({
      items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to list alerts",
      error: error.message,
    });
  }
};

// GET /api/alerts/:id
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      ...getCompanyFilter(req),
    })
      .populate("zone", "_id name")
      .populate("device", "_id name deviceId status")
      .populate("sensor", "_id name type")
      .populate("rule", "_id name metric operator threshold severity")
      .populate("acknowledgedBy", "_id firstName lastName email")
      .populate("resolvedBy", "_id firstName lastName email");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get alert",
      error: error.message,
    });
  }
};

// PATCH /api/alerts/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getCompanyFilter(req),
      },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark alert as read",
      error: error.message,
    });
  }
};

// PATCH /api/alerts/:id/acknowledge
exports.acknowledgeAlert = async (req, res) => {
  try {
    const update = {
      status: "acknowledged",
      acknowledgedAt: new Date(),
    };

    if (req.user?._id) {
      update.acknowledgedBy = req.user._id;
    }

    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getCompanyFilter(req),
      },
      update,
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to acknowledge alert",
      error: error.message,
    });
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const update = {
      status: "resolved",
      resolvedAt: new Date(),
      isRead: true,
    };

    if (req.user?._id) {
      update.resolvedBy = req.user._id;
    }

    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getCompanyFilter(req),
      },
      update,
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to resolve alert",
      error: error.message,
    });
  }
};

// DELETE /api/alerts/:id
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      ...getCompanyFilter(req),
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete alert",
      error: error.message,
    });
  }
};