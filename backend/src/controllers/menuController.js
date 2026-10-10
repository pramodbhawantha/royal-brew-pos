const pool = require("../config/db");
const logger = require("../utils/logger");

// =========================
// GET ALL MENU ITEMS
// =========================
const getMenuItems = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        menu_items.id,
        menu_items.category_id,
        categories.name AS category_name,
        menu_items.name,
        menu_items.description,
        menu_items.price,
        menu_items.is_available,
        menu_items.created_at
      FROM menu_items
      INNER JOIN categories
        ON menu_items.category_id = categories.id
      ORDER BY menu_items.id DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get menu items error:", error.message);

    res.status(500).json({
      message: "Failed to fetch menu items"
    });
  }
};

// =========================
// GET ONE MENU ITEM
// =========================
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItemId = Number(id);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        menu_items.id,
        menu_items.category_id,
        categories.name AS category_name,
        menu_items.name,
        menu_items.description,
        menu_items.price,
        menu_items.is_available,
        menu_items.created_at
      FROM menu_items
      INNER JOIN categories
        ON menu_items.category_id = categories.id
      WHERE menu_items.id = ?
      `,
      [menuItemId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get menu item error:", error.message);

    res.status(500).json({
      message: "Failed to fetch menu item"
    });
  }
};

// =========================
// CREATE MENU ITEM
// =========================
const createMenuItem = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price
    } = req.body;

    const categoryId = Number(category_id);
    const itemName = typeof name === "string" ? name.trim() : "";
    const itemDescription =
      typeof description === "string" ? description.trim() : "";
    const itemPrice = Number(price);

    // Validation
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        message: "Valid category_id is required"
      });
    }

    if (!itemName || itemName.length > 150) {
      return res.status(400).json({
        message: "Name is required and must be 150 characters or less"
      });
    }

    if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
      return res.status(400).json({
        message: "Price must be a valid number greater than 0"
      });
    }

    // Check category exists
    const [categories] = await pool.query(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        message: "Category not found"
      });
    }

    // Check duplicate menu item name
    const [existingItems] = await pool.query(
      "SELECT id FROM menu_items WHERE name = ?",
      [itemName]
    );

    if (existingItems.length > 0) {
      return res.status(409).json({
        message: "Menu item name already exists"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO menu_items
      (category_id, name, description, price)
      VALUES (?, ?, ?, ?)
      `,
      [
        categoryId,
        itemName,
        itemDescription || null,
        itemPrice
      ]
    );
    logger.info("Menu item created successfully", {
  menuItemId: result.insertId
});

    res.status(201).json({
      message: "Menu item created successfully",
      id: result.insertId
    });

  } catch (error) {
    logger.error("Create menu item error", {
  error: error.message
});
    res.status(500).json({
      message: "Failed to create menu item"
    });
  }
};

// =========================
// UPDATE MENU ITEM
// =========================
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItemId = Number(id);

    const {
      category_id,
      name,
      description,
      price,
      is_available
    } = req.body;

    const categoryId = Number(category_id);
    const itemName = typeof name === "string" ? name.trim() : "";
    const itemDescription =
      typeof description === "string" ? description.trim() : "";
    const itemPrice = Number(price);

    // Validate ID
    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    // Validate category
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        message: "Valid category_id is required"
      });
    }

    // Validate name
    if (!itemName || itemName.length > 150) {
      return res.status(400).json({
        message: "Name is required and must be 150 characters or less"
      });
    }

    // Validate price
    if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
      return res.status(400).json({
        message: "Price must be a valid number greater than 0"
      });
    }

    // Validate availability
    if (
      is_available !== undefined &&
      typeof is_available !== "boolean" &&
      is_available !== 0 &&
      is_available !== 1
    ) {
      return res.status(400).json({
        message: "is_available must be true or false"
      });
    }

    // Check menu item exists
    const [existingItem] = await pool.query(
      "SELECT id FROM menu_items WHERE id = ?",
      [menuItemId]
    );

    if (existingItem.length === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    // Check category exists
    const [categories] = await pool.query(
      "SELECT id FROM categories WHERE id = ?",
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        message: "Category not found"
      });
    }

    // Check duplicate name
    const [duplicateItems] = await pool.query(
      "SELECT id FROM menu_items WHERE name = ? AND id != ?",
      [itemName, menuItemId]
    );

    if (duplicateItems.length > 0) {
      return res.status(409).json({
        message: "Another menu item already uses this name"
      });
    }

    const availability =
      is_available === undefined
        ? true
        : Boolean(is_available);

    const [result] = await pool.query(
      `
      UPDATE menu_items
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        is_available = ?
      WHERE id = ?
      `,
      [
        categoryId,
        itemName,
        itemDescription || null,
        itemPrice,
        availability,
        menuItemId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }
    logger.info("Menu item updated successfully", {
  menuItemId
});

    res.status(200).json({
      message: "Menu item updated successfully"
    });

  } catch (error) {
    logger.error("Update menu item error", {
  error: error.message
});
    res.status(500).json({
      message: "Failed to update menu item"
    });
  }
};

// =========================
// DELETE MENU ITEM
// =========================
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItemId = Number(id);

    if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    const [result] = await pool.query(
      "DELETE FROM menu_items WHERE id = ?",
      [menuItemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }
    logger.info("Menu item deleted successfully", {
  menuItemId
});

    res.status(200).json({
      message: "Menu item deleted successfully"
    });

  } catch (error) {
    logger.error("Delete menu item error", {
  error: error.message
});

    res.status(500).json({
      message: "Failed to delete menu item"
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};