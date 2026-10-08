const express = require("express");

const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// VIEW MENU
// ADMIN + CASHIER
// =========================

// GET all menu items
router.get("/", authenticateToken, getMenuItems);

// GET one menu item
router.get("/:id", authenticateToken, getMenuItemById);


// =========================
// MANAGE MENU
// ADMIN ONLY
// =========================

// CREATE menu item
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createMenuItem
);

// UPDATE menu item
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateMenuItem
);

// DELETE menu item
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deleteMenuItem
);

module.exports = router;