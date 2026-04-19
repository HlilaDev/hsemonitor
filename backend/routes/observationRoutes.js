const router = require("express").Router();
const c = require("../controllers/observationController");
const { protect } = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.post(
  "/",
  protect,
  authorizeRoles("agent", "manager", "supervisor", "admin"),
  c.createObservation
);

router.get(
  "/",
  protect,
  authorizeRoles("agent", "manager", "supervisor", "admin"),
  c.listObservations
);

router.get(
  "/agent/:agentId/count",
  protect,
  authorizeRoles("manager", "supervisor", "admin"),
  c.getObservationsCountByAgent
);

router.get(
  "/:id",
  protect,
  authorizeRoles("agent", "manager", "supervisor", "admin"),
  c.getObservationById
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("manager", "supervisor", "admin"),
  c.updateObservation
);

router.patch(
  "/:id/assign",
  protect,
  authorizeRoles("manager", "supervisor", "admin"),
  c.assignObservation
);

router.patch(
  "/:id/resolve",
  protect,
  authorizeRoles("agent"),
  c.submitObservationResolution
);

router.patch(
  "/:id/validate",
  protect,
  authorizeRoles("manager", "supervisor", "admin"),
  c.validateObservationResolution
);

router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("manager", "supervisor", "admin"),
  c.rejectObservationResolution
);

router.post(
  "/:id/images",
  protect,
  authorizeRoles("agent", "manager", "supervisor", "admin"),
  c.addObservationImage
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("agent", "manager", "supervisor", "admin"),
  c.deleteObservation
);

module.exports = router;