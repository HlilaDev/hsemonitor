const express = require("express");
const router = express.Router();

const aiPredictionController = require("../controllers/aiPredictionController");
const { protect } = require("../middlewares/protect");

router.get("/zone/:zoneId", protect, aiPredictionController.predictZoneRisk);

module.exports = router;