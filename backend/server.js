const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");
const path = require("path");
const fs = require("fs");

const { startDeviceHeartbeatMonitor } = require("./services/deviceHeartbeatMonitor");
const { initSocket } = require("./socket/socketServer");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de requêtes. Réessayez plus tard.",
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Trop de tentatives de connexion.",
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "https://hsemonitor.com",
          "wss://hsemonitor.com",
        ],
        mediaSrc: ["'self'", "blob:", "https:", "http:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },

    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,

    permissionsPolicy: false, // disable helmet's handling — set manually below
  })
);

// Permissions-Policy set manually to guarantee correct syntax
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;

    delete obj.__proto__;
    delete obj.constructor;
    delete obj.prototype;

    for (const key of Object.keys(obj)) {
      sanitize(obj[key]);
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);


app.use("/api", globalLimiter);

app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api", routes);

connectDB();

require("./mqtt/mqttClient");

const server = http.createServer(app);

initSocket(server);

const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

startDeviceHeartbeatMonitor();
console.log("✅ Device heartbeat monitor started");