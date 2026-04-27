const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  getVendorCabBookings,
} = require("../controllers/cabBooking.controller");

/* ================= VENDOR ================= */

// 📥 Vendor can see who booked / cancelled
router.get("/bookings", protect, getVendorCabBookings);

module.exports = router;
