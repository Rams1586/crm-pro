/**
 * Run once:  node seed.js
 * Creates a demo admin account + 7 sample leads with notes.
 * Safe to re-run — skips already-existing records.
 * Set SEED_ADMIN_PASSWORD in backend/.env before seeding; never commit a real password.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Lead  = require("./models/Lead");
const Note  = require("./models/Note");

const LEADS = [
  { name:"Priya Sharma",   email:"priya@techcorp.in",    company:"TechCorp",     phone:"+91 9876543210", source:"website",       status:"new",       priority:"high",   value:50000, message:"Interested in enterprise plan." },
  { name:"Arjun Mehta",    email:"arjun@startupxyz.io",  company:"StartupXYZ",   phone:"+91 9123456780", source:"referral",      status:"contacted", priority:"medium", value:15000, message:"Needs a product demo." },
  { name:"Sanya Reddy",    email:"sanya@designhub.co",   company:"DesignHub",    phone:"+91 9988776655", source:"social_media",  status:"qualified", priority:"high",   value:30000, message:"Looking for custom integrations." },
  { name:"Kiran Babu",     email:"kiran@logisticsco.in", company:"LogisticsCo",  phone:"+91 9011223344", source:"cold_outreach", status:"converted", priority:"low",    value:75000, message:"Signed annual contract." },
  { name:"Meena Pillai",   email:"meena@healthplus.org",  company:"HealthPlus",  phone:"+91 9876001234", source:"event",         status:"lost",      priority:"low",    value:20000, message:"Went with a competitor." },
  { name:"Rohit Verma",    email:"rohit@finstack.com",   company:"FinStack",     phone:"+91 9321456789", source:"website",       status:"new",       priority:"medium", value:40000, message:"Wants pricing info." },
  { name:"Divya Nair",     email:"divya@edugrow.in",     company:"EduGrow",      phone:"+91 9654321098", source:"referral",      status:"contacted", priority:"high",   value:12000, message:"Needs onboarding support." },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Admin
    if (!await Admin.findOne({ email: "admin@crm.com" })) {
      await Admin.create({ name: "CRM Admin", email: "admin@crm.com", password: process.env.SEED_ADMIN_PASSWORD || "change-me-before-use" });
      console.log("✅  Admin created\n   Email:    admin@crm.com\n   (Password set from SEED_ADMIN_PASSWORD — change it after first login)\n");
    } else {
      console.log("⏭   Admin already exists — skipped\n");
    }

    // Leads + starter notes
    for (const ld of LEADS) {
      if (!await Lead.findOne({ email: ld.email })) {
        const lead = await Lead.create(ld);
        await Note.create({ lead: lead._id, author: "System", type: "note",
          content: `Lead created via seed. Original enquiry: "${ld.message}"` });
        console.log(`✅  Lead: ${ld.name} (${ld.status})`);
      }
    }

    console.log("\n🎉  Seed complete!");
    console.log("   Open http://localhost:5173 and log in with the seeded admin account\n");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
