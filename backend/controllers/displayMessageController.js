const DisplayMessage = require("../models/displayMessageModel");
const Device = require("../models/deviceModel");
const mqttClient = require("../mqtt/mqttClient");

const ALLOWED_ROLES = ["manager", "supervisor"];

const canManageMessages = (user) => {
  if (!user) return false;
  return ALLOWED_ROLES.includes(user.role);
};

const getCompanyId = (user) => {
  return user?.company?._id || user?.company || null;
};

const buildPayload = (message) => {
  return {
    id: String(message._id).slice(-8),
    title: (message.title || "").substring(0, 20),
    content: String(message.content).substring(0, 80),
    type: message.messageType,
    priority: message.priority,
    mode: message.displayMode,
    duration: message.durationSeconds,
  };
};

const buildMqttTopic = async (message) => {
  if (message.targetType === "device" && message.targetDevice) {
    const device = await Device.findById(message.targetDevice).select(
      "deviceId company"
    );

    if (!device) {
      throw new Error("Target device not found");
    }

    return {
      topic: `hsemonitor/${device.company}/${device.deviceId}/commands/display`,
      device,
    };
  }

  if (message.targetType === "zone" && message.targetZone) {
    return {
      topic: `hsemonitor/zones/${message.targetZone}/commands/display`,
      device: null,
    };
  }

  return {
    topic: "hsemonitor/broadcast/commands/display",
    device: null,
  };
};

const publishMqttMessage = (topic, payload) => {
  return new Promise((resolve, reject) => {
    if (!mqttClient) {
      return reject(new Error("MQTT client is not available"));
    }

    if (!mqttClient.connected) {
      return reject(new Error("MQTT client is not connected"));
    }

    mqttClient.publish(
      topic,
      JSON.stringify(payload),
      { qos: 1, retain: false },
      (error) => {
        if (error) {
          return reject(error);
        }

        resolve(true);
      }
    );
  });
};

const prepareMessageTransportData = async (message) => {
  const { topic, device } = await buildMqttTopic(message);
  const payload = buildPayload(message);

  message.mqttTopic = topic;
  message.payload = payload;

  return { topic, payload, device };
};

/**
 * CREATE MESSAGE
 */
exports.createDisplayMessage = async (req, res) => {
  try {
    console.log("========== CREATE DISPLAY MESSAGE ==========");
    console.log("Body:", JSON.stringify(req.body));
    console.log("User:", req.user?._id, "| Role:", req.user?.role, "| Company:", getCompanyId(req.user));

    const {
      title,
      content,
      messageType,
      priority,
      targetType,
      targetDevice,
      targetZone,
      displayMode,
      durationSeconds,
      scheduledAt,
      expiresAt,
      notes,
    } = req.body;

    const createdBy = req.user?._id || null;
    const company = getCompanyId(req.user);

    if (!createdBy) {
      console.warn("createDisplayMessage: no authenticated user");
      return res.status(401).json({
        message: "Authenticated user not found",
      });
    }

    if (!company) {
      console.warn("createDisplayMessage: user company is missing");
      return res.status(400).json({
        message: "User company is missing",
      });
    }

    if (!content || !String(content).trim()) {
      console.warn("createDisplayMessage: content is empty");
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    if (!targetType) {
      console.warn("createDisplayMessage: targetType missing");
      return res.status(400).json({
        message: "targetType is required",
      });
    }

    if (targetType === "device" && !targetDevice) {
      console.warn("createDisplayMessage: targetDevice missing for device targetType");
      return res.status(400).json({
        message: "targetDevice is required when targetType is device",
      });
    }

    if (targetType === "zone" && !targetZone) {
      console.warn("createDisplayMessage: targetZone missing for zone targetType");
      return res.status(400).json({
        message: "targetZone is required when targetType is zone",
      });
    }

    console.log("createDisplayMessage: creating message in DB...");

    const item = await DisplayMessage.create({
      title: title || "",
      content: String(content).trim(),
      messageType: messageType || "info",
      priority: priority || "normal",
      targetType,
      targetDevice: targetType === "device" ? targetDevice : null,
      targetZone: targetType === "zone" ? targetZone : null,
      displayMode: displayMode || "once",
      durationSeconds: Number(durationSeconds) || 10,
      scheduledAt: scheduledAt || null,
      expiresAt: expiresAt || null,
      notes: notes || "",
      status: "draft",
      createdBy,
      company,
    });

    console.log("✅ createDisplayMessage: message created with id:", item._id);

    return res.status(201).json({
      message: "Display message created successfully",
      item,
    });
  } catch (error) {
    console.error("❌ createDisplayMessage error:", error.name, "|", error.message);

    if (error.name === "ValidationError") {
      console.error("Validation details:", JSON.stringify(error.errors));
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
        details: error.errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create display message",
      error: error.message,
    });
  }
};

/**
 * GET ALL MESSAGES
 */
exports.getDisplayMessages = async (req, res) => {
  try {
    console.log("========== GET DISPLAY MESSAGES ==========");
    console.log("User:", req.user?._id, "| Company:", getCompanyId(req.user));
    console.log("Query:", JSON.stringify(req.query));

    const { status, targetType, page = 1, limit = 10, search = "" } = req.query;

    const filters = {
      company: getCompanyId(req.user),
    };

    if (status) {
      filters.status = status;
    }

    if (targetType) {
      filters.targetType = targetType;
    }

    if (search && String(search).trim()) {
      filters.$or = [
        { title: { $regex: String(search).trim(), $options: "i" } },
        { content: { $regex: String(search).trim(), $options: "i" } },
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      DisplayMessage.find(filters)
        .populate("createdBy", "firstName lastName email role")
        .populate("targetDevice", "name deviceId")
        .populate("targetZone", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      DisplayMessage.countDocuments(filters),
    ]);

    console.log(`getDisplayMessages: found ${total} messages (page ${pageNumber}/${Math.ceil(total / limitNumber)})`);

    return res.status(200).json({
      items,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("❌ getDisplayMessages error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch display messages",
      error: error.message,
    });
  }
};

/**
 * GET ONE MESSAGE
 */
exports.getDisplayMessageById = async (req, res) => {
  try {
    const item = await DisplayMessage.findOne({
      _id: req.params.id,
      company: getCompanyId(req.user),
    })
      .populate("createdBy", "firstName lastName email role")
      .populate("targetDevice", "name deviceId")
      .populate("targetZone", "name");

    if (!item) {
      return res.status(404).json({
        message: "Display message not found",
      });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch display message",
      error: error.message,
    });
  }
};

/**
 * UPDATE MESSAGE
 */
exports.updateDisplayMessage = async (req, res) => {
  try {
    if (!canManageMessages(req.user)) {
      return res.status(403).json({
        message: "Only manager and supervisor can update display messages",
      });
    }

    const existingMessage = await DisplayMessage.findOne({
      _id: req.params.id,
      company: getCompanyId(req.user),
    });

    if (!existingMessage) {
      return res.status(404).json({
        message: "Display message not found",
      });
    }

    if (existingMessage.status === "displayed") {
      return res.status(400).json({
        message: "Displayed message cannot be modified",
      });
    }

    const {
      title,
      content,
      messageType,
      priority,
      targetType,
      targetDevice,
      targetZone,
      displayMode,
      durationSeconds,
      scheduledAt,
      expiresAt,
      notes,
      status,
    } = req.body;

    if (targetType === "device" && !targetDevice) {
      return res.status(400).json({
        message: "targetDevice is required when targetType is device",
      });
    }

    if (targetType === "zone" && !targetZone) {
      return res.status(400).json({
        message: "targetZone is required when targetType is zone",
      });
    }

    if (title !== undefined) existingMessage.title = title;
    if (content !== undefined) existingMessage.content = String(content).trim();
    if (messageType !== undefined) existingMessage.messageType = messageType;
    if (priority !== undefined) existingMessage.priority = priority;
    if (targetType !== undefined) existingMessage.targetType = targetType;
    if (displayMode !== undefined) existingMessage.displayMode = displayMode;
    if (durationSeconds !== undefined) {
      existingMessage.durationSeconds = Number(durationSeconds) || 10;
    }
    if (scheduledAt !== undefined) existingMessage.scheduledAt = scheduledAt || null;
    if (expiresAt !== undefined) existingMessage.expiresAt = expiresAt || null;
    if (notes !== undefined) existingMessage.notes = notes;
    if (status !== undefined) existingMessage.status = status;

    if (existingMessage.targetType === "device") {
      existingMessage.targetDevice = targetDevice || existingMessage.targetDevice;
      existingMessage.targetZone = null;
    } else if (existingMessage.targetType === "zone") {
      existingMessage.targetZone = targetZone || existingMessage.targetZone;
      existingMessage.targetDevice = null;
    } else if (existingMessage.targetType === "broadcast") {
      existingMessage.targetDevice = null;
      existingMessage.targetZone = null;
    }

    if (!existingMessage.content || !String(existingMessage.content).trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    await prepareMessageTransportData(existingMessage);
    await existingMessage.save();

    return res.status(200).json({
      message: "Display message updated successfully",
      item: existingMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update display message",
      error: error.message,
    });
  }
};

/**
 * DELETE MESSAGE
 */
exports.deleteDisplayMessage = async (req, res) => {
  try {
    if (!canManageMessages(req.user)) {
      return res.status(403).json({
        message: "Only manager and supervisor can delete display messages",
      });
    }

    const existingMessage = await DisplayMessage.findOne({
      _id: req.params.id,
      company: getCompanyId(req.user),
    });

    if (!existingMessage) {
      return res.status(404).json({
        message: "Display message not found",
      });
    }

    await DisplayMessage.deleteOne({ _id: existingMessage._id });

    return res.status(200).json({
      message: "Display message deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete display message",
      error: error.message,
    });
  }
};

/**
 * PUBLISH MESSAGE
 */
exports.publishDisplayMessage = async (req, res) => {
  try {
    console.log("========== PUBLISH DISPLAY MESSAGE ==========");
    console.log("Message ID:", req.params.id);
    console.log("User:", req.user);
    console.log("User company:", getCompanyId(req.user));

    const existingMessage = await DisplayMessage.findById(req.params.id);

    console.log("Message found without company filter:", existingMessage ? "YES" : "NO");

    if (!existingMessage) {
      return res.status(404).json({
        message: "Display message not found by ID",
      });
    }

    console.log("Message company:", existingMessage.company);
    console.log("Target type:", existingMessage.targetType);
    console.log("Target device:", existingMessage.targetDevice);
    console.log("Content:", existingMessage.content);

    if (!existingMessage.content || !String(existingMessage.content).trim()) {
      return res.status(400).json({
        message: "Message content is required before publishing",
      });
    }

    if (
      existingMessage.status === "cancelled" ||
      existingMessage.status === "expired"
    ) {
      return res.status(400).json({
        message: "This message cannot be published",
      });
    }

    const { topic, payload, device } = await prepareMessageTransportData(existingMessage);

    console.log("Device found:", device ? device.deviceId : "N/A (zone or broadcast)");
    console.log("MQTT connected:", mqttClient?.connected);
    console.log("MQTT topic:", topic);
    console.log("MQTT payload:", JSON.stringify(payload));

    if (!mqttClient || !mqttClient.connected) {
      console.warn("⚠️  MQTT not connected — saving as queued");
      existingMessage.status = "queued";
      await existingMessage.save();
      return res.status(503).json({
        message: "MQTT broker not connected. Message saved as queued and will be sent when connection is restored.",
        item: existingMessage,
      });
    }

    await publishMqttMessage(topic, payload);

    console.log("✅ MQTT message published successfully");

    existingMessage.status = "sent";
    existingMessage.sentAt = new Date();
    await existingMessage.save();

    return res.status(200).json({
      message: "Display message published successfully",
      topic,
      payload,
      item: existingMessage,
    });
  } catch (error) {
    console.error("❌ publishDisplayMessage error:", error.name, "|", error.message);

    return res.status(500).json({
      message: "Failed to publish display message",
      error: error.message,
    });
  }
};

/**
 * CANCEL MESSAGE
 */
exports.cancelDisplayMessage = async (req, res) => {
  try {
    if (!canManageMessages(req.user)) {
      return res.status(403).json({
        message: "Only manager and supervisor can cancel display messages",
      });
    }

    const existingMessage = await DisplayMessage.findOne({
      _id: req.params.id,
      company: getCompanyId(req.user),
    });

    if (!existingMessage) {
      return res.status(404).json({
        message: "Display message not found",
      });
    }

    existingMessage.status = "cancelled";
    await existingMessage.save();

    return res.status(200).json({
      message: "Display message cancelled successfully",
      item: existingMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel display message",
      error: error.message,
    });
  }
};