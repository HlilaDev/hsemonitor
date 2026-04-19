const router = require("express").Router();
const c = require("../controllers/reportController");
const {protect} = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");
const uploadReportPdf = require("../middlewares/uploadReportPdf");



router.post(
  "/",
  protect,
  authorizeRoles("supervisor", "manager"),
  uploadReportPdf.single("pdf"),
  c.createReport
);

router.get(
  "/",
  protect,
  authorizeRoles("supervisor", "manager"),
  c.listReports
);

router.get(
  "/:id",
  protect,
  authorizeRoles("supervisor", "manager", "agent"),
  c.getReportById
);

router.put(
  "/:id",
  protect,
  authorizeRoles("supervisor", "manager"),
  uploadReportPdf.single("pdf"),
  c.updateReport
);

router.put(
  "/:id/metrics",
  protect,
  authorizeRoles("supervisor", "manager"),
  c.updateReportMetrics
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("supervisor", "manager"),
  c.deleteReport
);

module.exports = router;