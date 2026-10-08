const express = require("express");
const { register, login } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// REGISTER
// =========================
router.post("/register", register);

// =========================
// LOGIN
// =========================
router.post("/login", login);

// =========================
// PROTECTED USER ROUTE
// =========================
router.get("/me", authenticateToken, (req, res) => {
    res.json({
        message: "Authenticated user",
        user: req.user
    });
});

module.exports = router;