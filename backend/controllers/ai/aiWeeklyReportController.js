const AiWeeklyReport = require("../../models/ai/AiWeeklyReportModel");

const {
  buildAiWeeklyReportData,
} = require("../../services/ai/aiWeeklyReportDataService");

const {
  generateAiWeeklyReport,
} = require("../../services/ai/aiWeeklyReportGeminiService");

const {
  generateWeeklyReportPDF,
} = require("../../services/pdf/weeklyReportPdfService");

function getCompanyId(user) {
  return user?.company?._id || user?.company || null;
}

async function ensurePdf(report) {
  if (report.exportUrl) return report;

  const pdfUrl = await generateWeeklyReportPDF(report);

  return await AiWeeklyReport.findByIdAndUpdate(
    report._id,
    { exportUrl: pdfUrl },
    { new: true, runValidators: true }
  );
}

// POST /api/ai-weekly-reports/generate
exports.generateWeeklyReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req.user);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID introuvable.",
      });
    }

    const reportData = await buildAiWeeklyReportData(req.user);

    const existingReport = await AiWeeklyReport.findOne({
      company: companyId,
      weekStart: reportData.weekStart,
      weekEnd: reportData.weekEnd,
    });

    if (existingReport && !req.body?.regenerate) {
      const reportWithPdf = await ensurePdf(existingReport);

      return res.status(200).json({
        success: true,
        message: "Rapport déjà généré pour cette semaine.",
        report: reportWithPdf,
      });
    }

    const aiResult = await generateAiWeeklyReport(reportData);
    const aiReport = aiResult.parsed;

    const payload = {
      company: companyId,
      weekStart: reportData.weekStart,
      weekEnd: reportData.weekEnd,
      generatedBy: req.user._id,

      status: "generated",
      title: aiReport.title || "Rapport hebdomadaire IA HSE",
      summary: aiReport.summary || "",
      riskLevel: aiReport.riskLevel || "low",

      stats: reportData.stats,
      sections: aiReport.sections || {},

      recommendations: aiReport.recommendations || [],
      actionPlan: aiReport.actionPlan || [],

      aiProvider: "gemini",
      aiModel: aiResult.aiModel,
      rawAiResponse: aiResult.rawResponse,
      exportUrl: "",
    };

    let report = existingReport
      ? await AiWeeklyReport.findByIdAndUpdate(existingReport._id, payload, {
          new: true,
          runValidators: true,
        })
      : await AiWeeklyReport.create(payload);

    report = await ensurePdf(report);

    return res.status(201).json({
      success: true,
      message: "Rapport IA hebdomadaire généré avec succès.",
      report,
    });
  } catch (error) {
    console.error("generateWeeklyReport error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Quota Gemini dépassé ou billing non activé. Veuillez réessayer plus tard.",
        error: error.message,
      });
    }

    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message:
          "Modèle Gemini introuvable. Vérifiez GEMINI_MODEL dans le fichier .env.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du rapport IA hebdomadaire.",
      error: error.message,
    });
  }
};

// GET /api/ai-weekly-reports
exports.getWeeklyReports = async (req, res) => {
  try {
    const companyId = getCompanyId(req.user);

    const reports = await AiWeeklyReport.find({ company: companyId })
      .populate("generatedBy", "firstName lastName email role")
      .sort({ weekStart: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("getWeeklyReports error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des rapports.",
      error: error.message,
    });
  }
};

// GET /api/ai-weekly-reports/:id
exports.getWeeklyReportById = async (req, res) => {
  try {
    const companyId = getCompanyId(req.user);

    const report = await AiWeeklyReport.findOne({
      _id: req.params.id,
      company: companyId,
    })
      .populate("generatedBy", "firstName lastName email role")
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Rapport introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("getWeeklyReportById error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du rapport.",
      error: error.message,
    });
  }
};

// DELETE /api/ai-weekly-reports/:id
exports.deleteWeeklyReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req.user);

    const report = await AiWeeklyReport.findOneAndDelete({
      _id: req.params.id,
      company: companyId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Rapport introuvable.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rapport supprimé avec succès.",
    });
  } catch (error) {
    console.error("deleteWeeklyReport error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du rapport.",
      error: error.message,
    });
  }
};