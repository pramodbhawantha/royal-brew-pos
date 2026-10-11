
const express = require("express");

const { getCategories } = require("../controllers/categoryController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL CATEGORIES
router.get("/", authenticateToken, getCategories);

module.exports = router;
