const express = require("express");
const router = express.Router();

const { protect } = require("../../middlewares/protect");
const {
  generateWeeklyReport,
  getWeeklyReports,
  getWeeklyReportById,
  deleteWeeklyReport,
} = require("../../controllers/ai/aiWeeklyReportController");

// Générer ou régénérer le rapport de la semaine
router.post("/generate", protect, generateWeeklyReport);

// Liste des rapports IA hebdomadaires
router.get("/", protect, getWeeklyReports);

// Détail d’un rapport
router.get("/:id", protect, getWeeklyReportById);

// Supprimer un rapport
router.delete("/:id", protect, deleteWeeklyReport);

module.exports = router;