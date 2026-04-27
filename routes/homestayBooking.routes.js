const express = require("express");
const protectVendor = require("../middleware/auth.middleware");
const {
  createBooking,
  getVendorBookings,
  updateBookingStatus,
} = require("../controllers/homestayBooking.controller");

const router = express.Router();

/* USER */
router.post("/", createBooking);

/* VENDOR */
router.get("/vendor", protectVendor, getVendorBookings);
router.put("/:id/status", protectVendor, updateBookingStatus);

module.exports = router;
