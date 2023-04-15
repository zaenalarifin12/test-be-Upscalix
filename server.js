const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { knex } = require("./db/ConnectKnex");
const axios = require("axios");
const cron = require("node-cron");
const userRoutes = require("./routes/userRoutes");
const { sendBirthdayEmails } = require("./schedule/sendBirthdayEmail");
const fs = require("fs");
const path = require("path");
const { startWorker } = require("./queue/worker");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
const moment = require("moment-timezone");

dotenv.config();
process.env.TZ = "UTC";

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use(bodyParser.text());

// Use morgan middleware to log HTTP requests to a file
server.use(morgan("combined", { stream: accessLogStream }));

server.use("/", userRoutes);

if (process.env.NODE_ENV !== "test") {
  const timeZones = moment.tz.names();

  for (const timeZone of timeZones) {
    cron.schedule(
      "0 9 * * *",
      async () => {
        await sendBirthdayEmails(timeZone)();
      },
      {
        scheduled: true,
        timezone: timeZone,
      }
    );
  }
  startWorker();
}

server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

module.exports = server;
