const router = require("express").Router();
const c = require("../controllers/incidentEventController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, c.createIncidentEvent);
router.post("/automatic", protect, c.createAutomaticIncidentEvent);

router.get("/", protect, c.listIncidentEvents);
router.get("/:id", protect, c.getIncidentEventById);

router.patch("/:id", protect, c.updateIncidentEvent);
router.patch("/:id/review", protect, c.reviewIncidentEvent);
router.patch("/:id/resolve", protect, c.resolveIncidentEvent);

router.delete("/:id", protect, c.deleteIncidentEvent);

module.exports = router;