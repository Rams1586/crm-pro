const express = require("express");
const { body, validationResult } = require("express-validator");
const Lead = require("../models/Lead");
const Note = require("../models/Note");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// GET /api/leads — list with search, filter, sort, pagination
router.get("/", async (req, res) => {
  try {
    const { status, source, priority, search, sort = "-createdAt", page = 1, limit = 25 } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (source)   filter.source   = source;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: "i" } },
        { email:   { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter).sort(sort).skip(skip).limit(Number(limit));
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/stats — dashboard counters
router.get("/stats", async (req, res) => {
  try {
    const [counts, bySource, recentLeads, valueAgg] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
      Lead.find().sort("-createdAt").limit(5).select("name email status source createdAt company priority"),
      Lead.aggregate([{ $group: { _id: null, sum: { $sum: "$value" } } }]),
    ]);
    const byStatus = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
    counts.forEach((c) => { if (byStatus[c._id] !== undefined) byStatus[c._id] = c.count; });
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    res.json({ success: true, data: { total, totalValue: valueAgg[0]?.sum || 0, byStatus, bySource, recentLeads } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/:id
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads
router.post("/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("status").optional().isIn(["new","contacted","qualified","converted","lost"]),
    body("source").optional().isIn(["website","referral","social_media","cold_outreach","event","other"]),
    body("priority").optional().isIn(["low","medium","high"]),
    body("value").optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() });
    try {
      const lead = await Lead.create(req.body);
      res.status(201).json({ success: true, data: lead });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/leads/:id
router.put("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/leads/:id/status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["new","contacted","qualified","converted","lost"].includes(status))
    return res.status(400).json({ success: false, message: "Invalid status" });
  try {
    const update = { status };
    if (status === "contacted") update.lastContactedAt = new Date();
    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/leads/:id
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    await Note.deleteMany({ lead: req.params.id });
    res.json({ success: true, message: "Lead and notes deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
