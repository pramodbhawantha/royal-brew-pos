const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById
} = require("../controllers/orderController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET ORDER HISTORY
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "CASHIER"),
  getOrders
);
// GET SINGLE ORDER DETAILS
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "CASHIER"),
  getOrderById
);
// CREATE ORDER
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "CASHIER"),
  createOrder
);

module.exports = router;