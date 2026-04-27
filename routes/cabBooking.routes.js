const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  searchCabs,
  bookCab,
  getUserCabBookings,
  cancelCabBooking,
} = require("../controllers/cabBooking.controller");

/* ================= USER ================= */

// 🔍 Search
router.get("/search", searchCabs);

// 📌 Book
router.post("/book", protect, bookCab);

// 📥 My bookings
router.get("/my-bookings", protect, getUserCabBookings);

// ❌ Cancel booking
router.put("/cancel/:id", protect, cancelCabBooking);

module.exports = router;
