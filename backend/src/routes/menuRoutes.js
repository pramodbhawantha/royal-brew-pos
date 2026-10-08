const express = require("express");

const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuController");

const router = express.Router();

// GET all menu items
router.get("/", getMenuItems);

// GET one menu item
router.get("/:id", getMenuItemById);

// POST create menu item
router.post("/", createMenuItem);

// PUT update menu item
router.put("/:id", updateMenuItem);

// DELETE menu item
router.delete("/:id", deleteMenuItem);

module.exports = router;