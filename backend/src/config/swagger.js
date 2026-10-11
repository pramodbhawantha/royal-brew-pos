
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Royal Brew POS API",
      version: "1.0.0",
      description:
        "API documentation for the Royal Brew Café Point of Sale System",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
  },

 apis: [path.join(__dirname, "../routes/*.js").replace(/\\/g, "/")],
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = swaggerSpec.paths || {};

swaggerSpec.paths["/api/reports/daily"] = {
  get: {
    tags: ["Reports"],
    summary: "Get daily sales report",
    parameters: [
      {
        in: "query",
        name: "date",
        required: false,
        description: "Report date in YYYY-MM-DD format",
        schema: {
          type: "string",
          format: "date"
        }
      }
    ],
    responses: {
      "200": {
        description: "Daily sales report generated successfully"
      },
      "401": {
        description: "Authentication required"
      },
      "403": {
        description: "Access denied"
      }
    }
  }
};
module.exports = swaggerSpec;
