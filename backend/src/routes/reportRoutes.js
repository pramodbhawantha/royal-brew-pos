const express = require("express");
const router = express.Router();

const {
  getDailyReport,
  getMonthlyReport,
  getDailyReportCsv,
  getMonthlyReportCsv
} = require("../controllers/reportController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// DAILY SALES REPORT
router.get(
  "/daily",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDailyReport
);

// MONTHLY SALES REPORT
router.get(
  "/monthly",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getMonthlyReport
);
// DAILY REPORT CSV DOWNLOAD
router.get(
  "/daily/csv",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDailyReportCsv
);

// MONTHLY REPORT CSV DOWNLOAD
router.get(
  "/monthly/csv",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getMonthlyReportCsv
);
module.exports = router;