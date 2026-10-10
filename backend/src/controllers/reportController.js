const pool = require("../config/db");
const logger = require("../utils/logger");

// =========================
// DATE HELPERS
// =========================
const pad = (value) => String(value).padStart(2, "0");

const formatDate = (date) => {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("-");
};

const getToday = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("-");
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

// =========================
// BUILD SALES REPORT
// =========================
const buildSalesReport = async (startDate, endDate) => {
  const [summaryRows] = await pool.query(
    `
    SELECT
      COUNT(DISTINCT o.id) AS total_orders,

      COALESCE(
        SUM(
          CASE
            WHEN p.payment_status = 'PAID'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS total_revenue,

      COALESCE(
        SUM(
          CASE
            WHEN p.payment_status = 'PAID'
              AND p.payment_method = 'CASH'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS cash_sales,

      COALESCE(
        SUM(
          CASE
            WHEN p.payment_status = 'PAID'
              AND p.payment_method = 'CARD'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS card_sales

    FROM orders o
    LEFT JOIN payments p
      ON p.order_id = o.id

    WHERE o.order_date >= ?
      AND o.order_date < ?
      AND o.status = 'COMPLETED'
    `,
    [startDate, endDate]
  );

  const [topItems] = await pool.query(
    `
    SELECT
      mi.id AS menu_item_id,
      mi.name AS menu_item_name,
      SUM(oi.quantity) AS quantity_sold,
      SUM(oi.subtotal) AS sales_amount

    FROM order_items oi

    INNER JOIN orders o
      ON o.id = oi.order_id

    INNER JOIN payments p
      ON p.order_id = o.id

    INNER JOIN menu_items mi
      ON mi.id = oi.menu_item_id

    WHERE o.order_date >= ?
      AND o.order_date < ?
      AND o.status = 'COMPLETED'
      AND p.payment_status = 'PAID'

    GROUP BY mi.id, mi.name
    ORDER BY quantity_sold DESC
    LIMIT 10
    `,
    [startDate, endDate]
  );

  const summary = summaryRows[0];

  return {
    summary: {
      total_orders: Number(summary.total_orders),
      total_revenue: Number(summary.total_revenue),
      cash_sales: Number(summary.cash_sales),
      card_sales: Number(summary.card_sales)
    },

    top_items: topItems.map((item) => ({
      menu_item_id: Number(item.menu_item_id),
      menu_item_name: item.menu_item_name,
      quantity_sold: Number(item.quantity_sold),
      sales_amount: Number(item.sales_amount)
    }))
  };
};

// =========================
// DAILY SALES REPORT
// =========================
const getDailyReport = async (req, res) => {
  try {
    const reportDate =
      typeof req.query.date === "string"
        ? req.query.date
        : getToday();

    if (!isValidDate(reportDate)) {
      return res.status(400).json({
        message: "Date must be in YYYY-MM-DD format"
      });
    }

    const nextDate = new Date(
      `${reportDate}T00:00:00Z`
    );

    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const report = await buildSalesReport(
      `${reportDate} 00:00:00`,
      `${formatDate(nextDate)} 00:00:00`
    );

    return res.status(200).json({
      report_type: "DAILY",
      date: reportDate,
      ...report
    });

  } catch (error) {
    logger.error("Daily report failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to generate daily report"
    });
  }
};

// =========================
// MONTHLY SALES REPORT
// =========================
const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();

    const year =
      req.query.year === undefined
        ? now.getFullYear()
        : Number(req.query.year);

    const month =
      req.query.month === undefined
        ? now.getMonth() + 1
        : Number(req.query.month);

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        message: "Provide a valid year and month"
      });
    }

    const startDate =
      `${year}-${pad(month)}-01 00:00:00`;

    const nextMonth = new Date(
      Date.UTC(year, month, 1)
    );

    const endDate =
      `${formatDate(nextMonth)} 00:00:00`;

    const report = await buildSalesReport(
      startDate,
      endDate
    );

    return res.status(200).json({
      report_type: "MONTHLY",
      year,
      month,
      ...report
    });

  } catch (error) {
    logger.error("Monthly report failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to generate monthly report"
    });
  }
};
// =========================
// CSV HELPER
// =========================
const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const sendCsvFile = (res, filename, rows) => {
  const csv =
    "\uFEFF" +
    rows
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  return res.status(200).send(csv);
};

// =========================
// DAILY REPORT CSV
// =========================
const getDailyReportCsv = async (req, res) => {
  try {
    const reportDate =
      typeof req.query.date === "string"
        ? req.query.date
        : getToday();

    if (!isValidDate(reportDate)) {
      return res.status(400).json({
        message: "Date must be in YYYY-MM-DD format"
      });
    }

    const nextDate = new Date(
      `${reportDate}T00:00:00Z`
    );

    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const report = await buildSalesReport(
      `${reportDate} 00:00:00`,
      `${formatDate(nextDate)} 00:00:00`
    );

    const rows = [
      ["ROYAL BREW - DAILY SALES REPORT"],
      ["Date", reportDate],
      [],
      ["Metric", "Value"],
      ["Total Orders", report.summary.total_orders],
      ["Total Revenue (LKR)", report.summary.total_revenue],
      ["Cash Sales (LKR)", report.summary.cash_sales],
      ["Card Sales (LKR)", report.summary.card_sales],
      [],
      ["TOP SELLING ITEMS"],
      [
        "Menu Item ID",
        "Menu Item",
        "Quantity Sold",
        "Sales Amount (LKR)"
      ],
      ...report.top_items.map((item) => [
        item.menu_item_id,
        item.menu_item_name,
        item.quantity_sold,
        item.sales_amount
      ])
    ];

    return sendCsvFile(
      res,
      `royal-brew-daily-${reportDate}.csv`,
      rows
    );

  } catch (error) {
    logger.error("Daily CSV export failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to export daily report"
    });
  }
};

// =========================
// MONTHLY REPORT CSV
// =========================
const getMonthlyReportCsv = async (req, res) => {
  try {
    const now = new Date();

    const year =
      req.query.year === undefined
        ? now.getFullYear()
        : Number(req.query.year);

    const month =
      req.query.month === undefined
        ? now.getMonth() + 1
        : Number(req.query.month);

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        message: "Provide a valid year and month"
      });
    }

    const startDate =
      `${year}-${pad(month)}-01 00:00:00`;

    const nextMonth = new Date(
      Date.UTC(year, month, 1)
    );

    const endDate =
      `${formatDate(nextMonth)} 00:00:00`;

    const report = await buildSalesReport(
      startDate,
      endDate
    );

    const rows = [
      ["ROYAL BREW - MONTHLY SALES REPORT"],
      ["Year", year],
      ["Month", month],
      [],
      ["Metric", "Value"],
      ["Total Orders", report.summary.total_orders],
      ["Total Revenue (LKR)", report.summary.total_revenue],
      ["Cash Sales (LKR)", report.summary.cash_sales],
      ["Card Sales (LKR)", report.summary.card_sales],
      [],
      ["TOP SELLING ITEMS"],
      [
        "Menu Item ID",
        "Menu Item",
        "Quantity Sold",
        "Sales Amount (LKR)"
      ],
      ...report.top_items.map((item) => [
        item.menu_item_id,
        item.menu_item_name,
        item.quantity_sold,
        item.sales_amount
      ])
    ];

    return sendCsvFile(
      res,
      `royal-brew-monthly-${year}-${pad(month)}.csv`,
      rows
    );

  } catch (error) {
    logger.error("Monthly CSV export failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to export monthly report"
    });
  }
};
module.exports = {
  getDailyReport,
  getMonthlyReport,
  getDailyReportCsv,
  getMonthlyReportCsv
};