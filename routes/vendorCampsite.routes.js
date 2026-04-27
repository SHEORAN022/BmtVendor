const express = require("express");
const protect = require("../middleware/auth.middleware");

const {
  createCampsite,
  getMyCampsites
} = require("../controllers/vendorCampsite.controller");

const router = express.Router();

// 🔐 Auth middleware (vendor login required)
router.use(protect);

// ➕ Create campsite
router.post("/", createCampsite);

// 📥 Get vendor ke apne campsites
router.get("/", getMyCampsites);

module.exports = router;