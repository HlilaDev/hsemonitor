const Reading = require("../models/readingModel");
const Alert = require("../models/alertModel");
const PpeAlert = require("../models/ppeAlertModel");
const { predictHseRisk } = require("../services/geminiPredictionService");

exports.predictGlobalRisk = async (req, res) => {
  try {
    const readings = await Reading.find().sort({ ts: -1 }).limit(100);
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    const ppeAlerts = await PpeAlert.find().sort({ timestamp: -1 }).limit(50);

    const prediction = await predictHseRisk({ readings, alerts, ppeAlerts });

    res.json({
      zone: "global",
      generatedAt: new Date(),
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la prédiction IA globale",
      error: error.message,
    });
  }
};

exports.predictZoneRisk = async (req, res) => {
  try {
    const { zoneId } = req.params;

    const readings = await Reading.find({ zone: zoneId })
      .sort({ ts: -1 })
      .limit(50);

    const alerts = await Alert.find({ zone: zoneId })
      .sort({ createdAt: -1 })
      .limit(20);

    const ppeAlerts = await PpeAlert.find({ zone: zoneId })
      .sort({ timestamp: -1 })
      .limit(20);

    const prediction = await predictHseRisk({
      readings,
      alerts,
      ppeAlerts,
    });

    res.json({
      zone: zoneId,
      generatedAt: new Date(),
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la prédiction IA",
      error: error.message,
    });
  }
};