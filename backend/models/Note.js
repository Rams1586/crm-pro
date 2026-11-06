const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    lead:    { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    author:  { type: String, default: "Admin" },
    type:    { type: String, enum: ["note","call","email","meeting","follow_up"], default: "note" },
    content: { type: String, required: [true, "Note content is required"], trim: true, maxlength: 3000 },
    pinned:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);
