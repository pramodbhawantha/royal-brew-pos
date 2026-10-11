
const pool = require("../config/db");
const logger = require("../utils/logger");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );

    res.status(200).json(rows);
  } catch (error) {
    logger.error("Get categories error", {
      error: error.message
    });

    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
};

module.exports = {
  getCategories
};
