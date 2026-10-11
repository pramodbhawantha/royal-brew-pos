# ROYAL BREW POS

### Café Point of Sale and Menu Management System

Royal Brew POS is a web-based café management system designed to manage menu items, process customer orders, record payments, and generate sales reports.

## Features

- User authentication with password hashing and JWT.
- Role-based access for Admin and Cashier.
- Menu item management: add, view, edit, and delete menu items.
- Menu categories and item availability.
- Point of Sale (POS) with a shopping cart and automatic total calculation.
- Cash and card payment recording.
- Order history and order details.
- Daily and monthly sales reports.
- CSV report downloads.
- API documentation using Swagger.
- Application logging and input validation.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT) and bcryptjs
- **API Documentation:** Swagger UI
- **Version Control:** Git and GitHub

## Prerequisites

Install the following software before running the project:

- Node.js and npm
- MySQL Server
- Visual Studio Code (recommended)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pramodbhawantha/royal-brew-pos.git
cd royal-brew-pos
```

### 2. Set Up the Database

1. Start MySQL Server.
2. Open MySQL Workbench or another MySQL client.
3. Open `backend/database/schema.sql`.
4. Execute the SQL script to create the `royal_brew` database, tables, roles, categories, and initial menu items.

### 3. Configure the Backend

Open a terminal in the `backend` directory:

```bash
cd backend
npm install
```

Create or update `backend/.env` with your local configuration:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=royal_brew

JWT_SECRET=replace_with_a_long_random_secret
```

Replace the example database password and JWT secret with your own local values. Do not publish real credentials.

Start the backend:

```bash
node server.js
```

The backend runs at:

`http://localhost:5000`

### 4. Start the Frontend

Open a **second terminal** in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend address shown in the terminal. By default, Vite uses:

`http://localhost:5173`

Keep both the backend and frontend terminals running while using the application.

## API Documentation

When the backend is running, open:

`http://localhost:5000/api-docs`

Swagger UI provides the available API endpoints and their documentation.

## Main API Areas

- `/api/auth` — Registration and login
- `/api/menu` — Menu item operations
- `/api/categories` — Menu categories
- `/api/orders` — Order creation and order history
- `/api/reports` — Daily and monthly sales reports

Refer to Swagger UI for the documented endpoints and request formats.

## Security

- Passwords are hashed before storage.
- JWT authentication protects restricted API endpoints.
- Role-based authorization separates Admin and Cashier permissions.
- Parameterized SQL queries help prevent SQL injection.
- Input validation and application logging support safer operation and troubleshooting.

## Project Structure

```text
royal-brew-pos/
├── backend/
│   ├── database/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env
│   └── server.js
├── frontend/
│   └── src/
└── README.md
```

## Development Team

Royal Brew POS was developed as a Software Engineering course project.

## License

This project was developed for educational purposes.