require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter   = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: "Too many login attempts — try again in 15 minutes" },
});
app.use(globalLimiter);

// Routes
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV, uptime: Math.floor(process.uptime()) })
);
app.use("/api/auth",  authLimiter, require("./routes/auth"));
app.use("/api/leads", require("./routes/leads"));
app.use("/api/leads/:leadId/notes", require("./routes/notes"));

// 404 + error handler
app.use((req, res) => res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}` }));
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  CRM API → http://localhost:${PORT}   [${process.env.NODE_ENV}]`));
