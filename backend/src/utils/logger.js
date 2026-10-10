const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Log folder location
const logDir = path.join(__dirname, "../../logs");

// Create the folder if it does not exist
fs.mkdirSync(logDir, { recursive: true });

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: {
    service: "royal-brew-pos-api"
  },

  transports: [
    // Save errors separately
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error"
    }),

    // Save all log messages
    new winston.transports.File({
      filename: path.join(logDir, "combined.log")
    })
  ]
});

// Show readable logs in the development terminal
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      )
    })
  );
}

module.exports = logger;