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

/**
 * @swagger
 * /api/reports/daily:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get daily sales report
 *     responses:
 *       200:
 *         description: Daily report retrieved successfully
 */
// DAILY SALES REPORT
router.get(
  "/daily",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDailyReport
);

/**
 * @swagger
 * /api/reports/monthly:
 *   get:
 *     summary: Get monthly sales report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Report year, for example 2026
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         required: true
 *         description: Report month from 1 to 12
 *     responses:
 *       200:
 *         description: Monthly sales report generated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
// MONTHLY SALES REPORT
router.get(
  "/monthly",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getMonthlyReport
);


/**
 * @swagger
 * /api/reports/daily/csv:
 *   get:
 *     summary: Download daily sales report as CSV
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Report date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Daily sales report CSV downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */

// DAILY REPORT CSV DOWNLOAD
router.get(
  "/daily/csv",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getDailyReportCsv
);


/**
 * @swagger
 * /api/reports/monthly/csv:
 *   get:
 *     summary: Download monthly sales report as CSV
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Report year, for example 2026
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         required: true
 *         description: Report month from 1 to 12
 *     responses:
 *       200:
 *         description: Monthly sales report CSV downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */

// MONTHLY REPORT CSV DOWNLOAD
router.get(
  "/monthly/csv",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getMonthlyReportCsv
);
module.exports = router;