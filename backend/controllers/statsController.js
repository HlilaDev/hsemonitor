const incidentStatsService = require("../services/stats/incidentStatsService");
const observationStatsService = require("../services/stats/observationStatsService");

exports.getIncidentStats = async (req, res) => {
  try {
    const data = await incidentStatsService.getIncidentStats(req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get incident stats error:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques incidents",
    });
  }
};

exports.getObservationStats = async (req, res) => {
  try {
    const data = await observationStatsService.getObservationStats(req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get observation stats error:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques observations",
    });
  }
};

exports.getHseOverviewStats = async (req, res) => {
  try {
    const [incidents, observations] = await Promise.all([
      incidentStatsService.getIncidentStats(req.user),
      observationStatsService.getObservationStats(req.user),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        incidents,
        observations,
      },
    });
  } catch (err) {
    console.error("Get HSE overview stats error:", err);

    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques HSE",
    });
  }
};