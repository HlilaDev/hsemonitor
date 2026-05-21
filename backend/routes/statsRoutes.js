const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getIncidentStats,
  getObservationStats,
  getHseOverviewStats
} = require("../controllers/statsController");

// 🔹 Stats incidents (tous les rôles HSE)
router.get(
  "/incidents",
  protect,
  authorizeRoles("manager", "supervisor", "agent"),
  getIncidentStats
);

// 🔹 Stats observations
router.get(
  "/observations",
  protect,
  authorizeRoles("manager", "supervisor", "agent"),
  getObservationStats
);

// 🔹 Dashboard global HSE
router.get(
  "/hse-overview",
  protect,
  authorizeRoles("manager", "supervisor", "agent"),
  getHseOverviewStats
);

module.exports = router;