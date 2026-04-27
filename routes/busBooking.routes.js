const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  bookBus,
  cancelBusBooking,
  getUserBusBookings,
  getVendorBusBookings,
} = require("../controllers/busBooking.controller");

/* ================= USER ================= */

// Book bus
router.post("/book", protect, bookBus);

// My bookings
router.get("/my-bookings", protect, getUserBusBookings);

// Cancel booking
router.put("/cancel/:id", protect, cancelBusBooking);

/* ================= VENDOR ================= */

// Vendor sees bookings of his buses
router.get("/vendor-bookings", protect, getVendorBusBookings);

module.exports = router;
