const express = require("express");
const protect = require("../middleware/auth.middleware");
const {
  createBooking,
  getVendorBookings,
  updateBookingStatus,
} = require("../controllers/holidayBooking.controller");

const router = express.Router();

/* USER */
router.post("/", createBooking);

/* VENDOR */
router.get("/vendor", protect, getVendorBookings);
router.put("/:id/status", protect, updateBookingStatus);

module.exports = router;
