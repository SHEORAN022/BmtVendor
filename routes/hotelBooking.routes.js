const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  bookHotel,
  getUserHotelBookings,
  getVendorHotelBookings,
  cancelHotelBooking,
} = require("../controllers/hotelBooking.controller");

/* ================= USER ================= */

// 📌 Book hotel
router.post("/book", protect, bookHotel);

// 📥 My hotel bookings
router.get("/my", protect, getUserHotelBookings);

// ❌ Cancel booking
router.put("/cancel/:id", protect, cancelHotelBooking);

/* ================= VENDOR ================= */

// 📊 Vendor hotel bookings
router.get("/vendor", protect, getVendorHotelBookings);

module.exports = router;
