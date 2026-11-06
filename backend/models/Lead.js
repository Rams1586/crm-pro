const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true, maxlength: 120 },
    email:    { type: String, required: [true, "Email is required"], trim: true, lowercase: true, maxlength: 150 },
    phone:    { type: String, trim: true, maxlength: 30, default: "" },
    company:  { type: String, trim: true, maxlength: 120, default: "" },
    source:   { type: String, enum: ["website","referral","social_media","cold_outreach","event","other"], default: "website" },
    status:   { type: String, enum: ["new","contacted","qualified","converted","lost"], default: "new" },
    priority: { type: String, enum: ["low","medium","high"], default: "medium" },
    value:    { type: Number, default: 0, min: 0 },
    message:  { type: String, trim: true, maxlength: 2000, default: "" },
    assignedTo:     { type: String, trim: true, default: "" },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

LeadSchema.index({ name: "text", email: "text", company: "text" });

module.exports = mongoose.model("Lead", LeadSchema);
