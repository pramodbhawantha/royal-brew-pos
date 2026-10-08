const pool = require("../config/db");

// Get all menu items
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

// Get one menu item
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

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
      [id]
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

// Create menu item
const createMenuItem = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        message: "Category, name and price are required"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO menu_items
      (category_id, name, description, price)
      VALUES (?, ?, ?, ?)
      `,
      [category_id, name, description || null, price]
    );

    res.status(201).json({
      message: "Menu item created successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("Create menu item error:", error.message);

    res.status(500).json({
      message: "Failed to create menu item"
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      name,
      description,
      price,
      is_available
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        message: "Category, name and price are required"
      });
    }

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
        category_id,
        name,
        description || null,
        price,
        is_available ?? true,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      message: "Menu item updated successfully"
    });
  } catch (error) {
    console.error("Update menu item error:", error.message);

    res.status(500).json({
      message: "Failed to update menu item"
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM menu_items WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    console.error("Delete menu item error:", error.message);

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