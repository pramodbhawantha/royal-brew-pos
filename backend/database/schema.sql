CREATE DATABASE IF NOT EXISTS royal_brew;

USE royal_brew;

-- =========================
-- ROLES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- =========================
-- CATEGORIES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MENU ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- =========================
-- ORDERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'COMPLETED',

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- ORDER ITEMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- =========================
-- PAYMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'PAID',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =========================
-- INITIAL ROLES
-- =========================
INSERT IGNORE INTO roles (name)
VALUES
    ('ADMIN'),
    ('CASHIER');

-- =========================
-- INITIAL CATEGORIES
-- =========================
INSERT IGNORE INTO categories (name)
VALUES
    ('Coffee'),
    ('Tea'),
    ('Cold Drinks'),
    ('Snacks'),
    ('Desserts');

-- =========================
-- INITIAL MENU ITEMS
-- =========================
INSERT IGNORE INTO menu_items
    (category_id, name, description, price)
VALUES
    (1, 'Espresso', 'Rich and strong classic espresso', 450.00),
    (1, 'Cappuccino', 'Espresso with steamed milk and foam', 650.00),
    (1, 'Café Latte', 'Smooth espresso with steamed milk', 700.00),
    (2, 'Ceylon Tea', 'Classic Sri Lankan black tea', 350.00),
    (3, 'Iced Coffee', 'Chilled coffee served with ice', 600.00),
    (4, 'Chicken Sandwich', 'Grilled chicken sandwich', 750.00),
    (5, 'Chocolate Cake', 'Rich chocolate cake slice', 550.00);