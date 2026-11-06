const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register  (first-time setup)
router.post("/register",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() });
    const { name, email, password } = req.body;
    try {
      if (await Admin.findOne({ email }))
        return res.status(400).json({ success: false, message: "Email already registered" });
      const admin = await Admin.create({ name, email, password });
      res.status(201).json({ success: true, token: signToken(admin._id), admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/auth/login
router.post("/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ success: false, message: "Invalid credentials" });
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ email }).select("+password");
      if (!admin || !(await admin.matchPassword(password)))
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      res.json({ success: true, token: signToken(admin._id), admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
