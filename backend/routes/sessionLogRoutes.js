const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getMySessionLogs,
  getCompanySessionLogs,
} = require("../controllers/sessionLogController");

router.get("/me", protect, getMySessionLogs);

router.get(
  "/",
  protect,
  authorizeRoles("manager", "admin", "supervisor", "superAdmin"),
  getCompanySessionLogs
);

module.exports = router;