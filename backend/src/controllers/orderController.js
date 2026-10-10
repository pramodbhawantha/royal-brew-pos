const pool = require("../config/db");
const logger = require("../utils/logger");

// =========================
// CREATE NEW ORDER
// =========================
const createOrder = async (req, res) => {
  let connection;

  try {
    const { items, payment_method } = req.body;
    const userId = Number(req.user?.id);

    // Validate logged-in user
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one order item is required"
      });
    }

    // Validate payment method
    const paymentMethod =
      typeof payment_method === "string"
        ? payment_method.trim().toUpperCase()
        : "";

    if (!["CASH", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Payment method must be CASH or CARD"
      });
    }

    // Validate each item
    const orderItems = [];

    for (const item of items) {
      const menuItemId = Number(item?.menu_item_id);
      const quantity = Number(item?.quantity);

      if (
        !Number.isInteger(menuItemId) ||
        menuItemId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message: "Each item needs a valid menu_item_id and quantity"
        });
      }

      orderItems.push({
        menu_item_id: menuItemId,
        quantity
      });
    }

    // Do not accept duplicate item rows
    const itemIds = orderItems.map(
      item => item.menu_item_id
    );

    if (new Set(itemIds).size !== itemIds.length) {
      return res.status(400).json({
        message: "Each menu item must appear only once"
      });
    }

    // Start database transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get actual prices from the database
    const [menuRows] = await connection.query(
      `SELECT id, name, price, is_available
       FROM menu_items
       WHERE id IN (?)`,
      [itemIds]
    );

    if (menuRows.length !== itemIds.length) {
      await connection.rollback();

      return res.status(400).json({
        message: "One or more menu items were not found"
      });
    }

    const menuMap = new Map(
      menuRows.map(item => [Number(item.id), item])
    );

    let totalCents = 0;
    const preparedItems = [];

    for (const item of orderItems) {
      const menuItem = menuMap.get(item.menu_item_id);

      if (!menuItem || !Boolean(menuItem.is_available)) {
        await connection.rollback();

        return res.status(400).json({
          message: "A menu item is currently unavailable"
        });
      }

      const unitPriceCents = Math.round(
        Number(menuItem.price) * 100
      );

      const subtotalCents =
        unitPriceCents * item.quantity;

      totalCents += subtotalCents;

      preparedItems.push({
        menu_item_id: Number(menuItem.id),
        name: menuItem.name,
        quantity: item.quantity,
        unit_price: (unitPriceCents / 100).toFixed(2),
        subtotal: (subtotalCents / 100).toFixed(2)
      });
    }

    const totalAmount =
      (totalCents / 100).toFixed(2);

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, status)
       VALUES (?, ?, ?)`,
      [userId, totalAmount, "COMPLETED"]
    );

    const orderId = orderResult.insertId;

    // Save order items
    for (const item of preparedItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, menu_item_id, quantity,
          unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.menu_item_id,
          item.quantity,
          item.unit_price,
          item.subtotal
        ]
      );
    }

    // Record payment
    await connection.query(
      `INSERT INTO payments
       (order_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?)`,
      [
        orderId,
        totalAmount,
        paymentMethod,
        "PAID"
      ]
    );

    // Save all database changes together
    await connection.commit();

    logger.info("Order created successfully", {
      orderId,
      userId,
      totalAmount,
      paymentMethod
    });

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        id: orderId,
        user_id: userId,
        total_amount: Number(totalAmount),
        status: "COMPLETED"
      },
      payment: {
        amount: Number(totalAmount),
        payment_method: paymentMethod,
        payment_status: "PAID"
      },
      items: preparedItems
    });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logger.error("Order rollback failed", {
          error: rollbackError.message
        });
      }
    }

    logger.error("Create order failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to create order"
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// =========================
// GET ORDER HISTORY
// =========================
const getOrders = async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const role = req.user?.role;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const sql = `
      SELECT
        o.id,
        o.user_id,
        u.name AS cashier_name,
        o.order_date,
        o.total_amount,
        o.status,
        p.payment_method,
        p.payment_status,
        COUNT(oi.id) AS item_count
      FROM orders o
      INNER JOIN users u
        ON o.user_id = u.id
      LEFT JOIN payments p
        ON o.id = p.order_id
      LEFT JOIN order_items oi
        ON o.id = oi.order_id
      ${role === "ADMIN" ? "" : "WHERE o.user_id = ?"}
      GROUP BY
        o.id,
        o.user_id,
        u.name,
        o.order_date,
        o.total_amount,
        o.status,
        p.payment_method,
        p.payment_status
      ORDER BY o.order_date DESC
    `;

    const params = role === "ADMIN" ? [] : [userId];

    const [orders] = await pool.query(sql, params);

    return res.status(200).json({
      count: orders.length,
      orders
    });

  } catch (error) {
    logger.error("Get order history failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to fetch order history"
    });
  }
};
// =========================
// GET ORDER DETAILS
// =========================
const getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const userId = Number(req.user?.id);
    const role = req.user?.role;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    // Get order and payment details
    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        o.user_id,
        u.name AS cashier_name,
        o.order_date,
        o.total_amount,
        o.status,
        p.amount AS payment_amount,
        p.payment_method,
        p.payment_status,
        p.paid_at
      FROM orders o
      INNER JOIN users u
        ON o.user_id = u.id
      LEFT JOIN payments p
        ON o.id = p.order_id
      WHERE o.id = ?
      `,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const order = orders[0];

    // Cashiers can only view their own orders
    if (
      role !== "ADMIN" &&
      Number(order.user_id) !== userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Get items belonging to this order
    const [items] = await pool.query(
      `
      SELECT
        oi.menu_item_id,
        mi.name AS menu_item_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal
      FROM order_items oi
      LEFT JOIN menu_items mi
        ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
      `,
      [orderId]
    );

    return res.status(200).json({
      order: {
        ...order,
        total_amount: Number(order.total_amount)
      },
      items
    });

  } catch (error) {
    logger.error("Get order details failed", {
      error: error.message
    });

    return res.status(500).json({
      message: "Failed to fetch order details"
    });
  }
};
module.exports = {
  createOrder,
  getOrders,
  getOrderById
};