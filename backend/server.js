require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./src/utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const pool = require("./src/config/db");
const menuRoutes = require("./src/routes/menuRoutes");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/menu", menuRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);

// Basic API test route
app.get("/", (req, res) => {
  res.json({
    message: "Royal Brew POS API is running!"
  });
});

// Database test route
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "OK",
      message: "Royal Brew API and MySQL are connected!"
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed"
    });
  }
});

app.listen(PORT, () => {
  logger.info(`Royal Brew POS backend running on http://localhost:${PORT}`);
});