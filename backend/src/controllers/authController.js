const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// REGISTER USER
// =========================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                message: "Name must be at least 2 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();

        // =========================
        // PUBLIC REGISTRATION
        // CASHIER ONLY
        // =========================
        const registrationRole = "CASHIER";

        // Check existing user
        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Find CASHIER role
        const [roles] = await pool.query(
            "SELECT id FROM roles WHERE name = ?",
            [registrationRole]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                message: "CASHIER role not found"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user as CASHIER
        const [result] = await pool.query(
            `INSERT INTO users
            (role_id, name, email, password)
            VALUES (?, ?, ?, ?)`,
            [
                roles[0].id,
                normalizedName,
                normalizedEmail,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId,
            role: registrationRole
        });

    } catch (error) {
        console.error("Register error:", error.message);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};

// =========================
// LOGIN USER
// =========================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user with role
        const [users] = await pool.query(
            `SELECT
                u.id,
                u.name,
                u.email,
                u.password,
                u.is_active,
                r.name AS role
             FROM users u
             INNER JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check active status
        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = {
    register,
    login
};