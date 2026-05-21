const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateWeeklyReportPDF = (report) => {
  return new Promise((resolve, reject) => {
    // 🔥 Format date propre
    const formatDate = (date) => {
      return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const fileName = `weekly-report-${Date.now()}.pdf`;

    // 🔥 Assurer dossier existe
    const pdfDir = path.join(__dirname, "../../uploads/pdf");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const filePath = path.join(pdfDir, fileName);

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ===== HEADER =====
    doc
      .fontSize(18)
      .fillColor("#111827")
      .text("Rapport Hebdomadaire HSE IA", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("#000000")
      .text(
        `Période : ${formatDate(report.weekStart)} → ${formatDate(
          report.weekEnd
        )}`
      );

    doc.text(`Niveau de risque : ${report.riskLevel.toUpperCase()}`);
    doc.moveDown();

    // ===== SUMMARY =====
    doc.fontSize(14).text("Résumé", { underline: true });
    doc.fontSize(11).text(report.summary || "—");
    doc.moveDown();

    // ===== INCIDENTS =====
    doc.fontSize(14).text("Incidents", { underline: true });
    doc.fontSize(11).text(report.sections?.incidents || "—");
    doc.moveDown();

    // ===== OBSERVATIONS =====
    doc.fontSize(14).text("Observations", { underline: true });
    doc.fontSize(11).text(report.sections?.observations || "—");
    doc.moveDown();

    // ===== ALERTS =====
    doc.fontSize(14).text("Alertes IoT", { underline: true });
    doc.fontSize(11).text(report.sections?.alerts || "—");
    doc.moveDown();

    // ===== RECOMMENDATIONS =====
    doc.fontSize(14).text("Recommandations", { underline: true });

    (report.recommendations || []).forEach((rec, i) => {
      doc
        .fontSize(11)
        .fillColor("#111827")
        .text(`${i + 1}. ${rec.title} (${rec.priority})`);

      doc
        .fontSize(10)
        .fillColor("#374151")
        .text(rec.description || "—");

      doc.moveDown(0.5);
    });

    doc.end();

    stream.on("finish", () => {
      resolve(`/uploads/pdf/${fileName}`);
    });

    stream.on("error", reject);
  });
};