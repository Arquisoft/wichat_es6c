const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "info", // Nivel de log (info, warn, error, etc.)
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "logs", "game_logs.log") }), // Guardado en archivo
    new winston.transports.Console() // También lo muestra en la consola
  ],
});

module.exports = logger;