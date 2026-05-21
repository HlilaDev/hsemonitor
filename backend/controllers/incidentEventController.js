const IncidentEvent = require("../models/IncidentEventModel");

// Helpers
const getUserCompanyId = (req) => {
  return req.user?.company?._id || req.user?.company || req.body.company || req.query.company;
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const populateIncident = (query) => {
  return query
    .populate("company", "name industry")
    .populate("zone", "name label")
    .populate("employee", "firstName lastName fullName email")
    .populate("reportedBy", "firstName lastName fullName email")
    .populate("device")
    .populate("reading")
    .populate("reviewedBy", "firstName lastName fullName email")
    .populate("resolvedBy", "firstName lastName fullName email");
};

// Create manual incident
exports.createIncidentEvent = async (req, res) => {
  try {
    const company = getUserCompanyId(req);
    const reportedBy = getUserId(req);

    const {
      title,
      description,
      type = "MANUAL_REPORT",
      zone,
      employee,
      severity = "medium",
      priority = "normal",
      images = [],
    } = req.body;

    if (!company) {
      return res.status(400).json({ message: "Company is required" });
    }

    if (!reportedBy) {
      return res.status(401).json({ message: "Authenticated user is required" });
    }

    if (!title || !zone) {
      return res.status(400).json({
        message: "Title and zone are required",
      });
    }

    const doc = await IncidentEvent.create({
      title,
      description,
      type,
      sourceType: "manual",
      company,
      zone,
      employee: employee || undefined,
      reportedBy,
      severity,
      priority,
      images,
      status: "open",
    });

    const populated = await populateIncident(IncidentEvent.findById(doc._id));

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({
      message: "Create incident event failed",
      error: err.message,
    });
  }
};

// Create automatic incident from IoT / camera / AI
exports.createAutomaticIncidentEvent = async (req, res) => {
  try {
    const company = getUserCompanyId(req);

    const {
      title,
      description,
      type,
      sourceType,
      zone,
      device,
      reading,
      confidenceScore,
      evidence,
      severity = "medium",
      priority = "normal",
    } = req.body;

    if (!company) {
      return res.status(400).json({ message: "Company is required" });
    }

    if (!type || !sourceType) {
      return res.status(400).json({
        message: "Type and sourceType are required",
      });
    }

    if (!["camera", "sensor"].includes(sourceType)) {
      return res.status(400).json({
        message: "sourceType must be camera or sensor for automatic incidents",
      });
    }

    const doc = await IncidentEvent.create({
      title: title || type,
      description,
      type,
      sourceType,
      company,
      zone,
      device,
      reading,
      confidenceScore,
      evidence,
      severity,
      priority,
      status: "open",
    });

    const populated = await populateIncident(IncidentEvent.findById(doc._id));

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({
      message: "Create automatic incident event failed",
      error: err.message,
    });
  }
};

// List incidents
exports.listIncidentEvents = async (req, res) => {
  try {
    const {
      company,
      zone,
      employee,
      reportedBy,
      device,
      sourceType,
      type,
      status,
      severity,
      priority,
      minConfidence,
      maxConfidence,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const filter = {};

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;
    if (company && !userCompany) filter.company = company;

    if (zone) filter.zone = zone;
    if (employee) filter.employee = employee;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (device) filter.device = device;
    if (sourceType) filter.sourceType = sourceType;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;

    if (minConfidence || maxConfidence) {
      filter.confidenceScore = {};
      if (minConfidence) filter.confidenceScore.$gte = Number(minConfidence);
      if (maxConfidence) filter.confidenceScore.$lte = Number(maxConfidence);
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      populateIncident(
        IncidentEvent.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(safeLimit)
      ),
      IncidentEvent.countDocuments(filter),
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
  } catch (err) {
    res.status(500).json({
      message: "List incident events failed",
      error: err.message,
    });
  }
};

// Get by id
exports.getIncidentEventById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;

    const doc = await populateIncident(IncidentEvent.findOne(filter));

    if (!doc) {
      return res.status(404).json({ message: "IncidentEvent not found" });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({
      message: "Get incident event failed",
      error: err.message,
    });
  }
};

// Update
exports.updateIncidentEvent = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;

    const blockedFields = [
      "company",
      "reportedBy",
      "resolvedBy",
      "resolvedAt",
      "reviewedBy",
      "reviewedAt",
    ];

    for (const field of blockedFields) {
      delete req.body[field];
    }

    const doc = await populateIncident(
      IncidentEvent.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
      })
    );

    if (!doc) {
      return res.status(404).json({ message: "IncidentEvent not found" });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({
      message: "Update incident event failed",
      error: err.message,
    });
  }
};

// Review incident
exports.reviewIncidentEvent = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;

    const reviewedBy = getUserId(req);

    const doc = await populateIncident(
      IncidentEvent.findOneAndUpdate(
        filter,
        {
          status: "reviewed",
          reviewedBy,
          reviewedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      )
    );

    if (!doc) {
      return res.status(404).json({ message: "IncidentEvent not found" });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({
      message: "Review incident event failed",
      error: err.message,
    });
  }
};

// Mark as resolved / closed
exports.resolveIncidentEvent = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;

    const {
      status = "closed",
      resolutionNote,
      falsePositiveReason,
    } = req.body;

    const resolvedBy = getUserId(req);

    if (!["closed", "false_positive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be closed or false_positive",
      });
    }

    const update = {
      status,
      resolvedBy,
      resolvedAt: new Date(),
      resolutionNote,
    };

    if (status === "false_positive") {
      update.falsePositiveReason = falsePositiveReason;
    }

    const doc = await populateIncident(
      IncidentEvent.findOneAndUpdate(filter, update, {
        new: true,
        runValidators: true,
      })
    );

    if (!doc) {
      return res.status(404).json({ message: "IncidentEvent not found" });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({
      message: "Resolve incident event failed",
      error: err.message,
    });
  }
};

// Delete incident
exports.deleteIncidentEvent = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    const userCompany = getUserCompanyId(req);
    if (userCompany) filter.company = userCompany;

    const doc = await IncidentEvent.findOneAndDelete(filter);

    if (!doc) {
      return res.status(404).json({ message: "IncidentEvent not found" });
    }

    res.json({
      message: "IncidentEvent deleted successfully",
      deletedId: doc._id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Delete incident event failed",
      error: err.message,
    });
  }
};