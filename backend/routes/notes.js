const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const Lead = require("../models/Lead");
const { protect } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
router.use(protect);

// GET /api/leads/:leadId/notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ lead: req.params.leadId }).sort("-createdAt");
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads/:leadId/notes
router.post("/",
  [body("content").trim().notEmpty().withMessage("Note content required")],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() });
    try {
      const lead = await Lead.findById(req.params.leadId);
      if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
      const note = await Note.create({
        lead: req.params.leadId,
        author: req.admin.name,
        content: req.body.content,
        type: req.body.type || "note",
        pinned: req.body.pinned || false,
      });
      if (req.body.nextFollowUpAt) {
        await Lead.findByIdAndUpdate(req.params.leadId, { nextFollowUpAt: req.body.nextFollowUpAt });
      }
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/leads/:leadId/notes/:noteId
router.patch("/:noteId", async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, lead: req.params.leadId },
      req.body, { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/leads/:leadId/notes/:noteId
router.delete("/:noteId", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, lead: req.params.leadId });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
