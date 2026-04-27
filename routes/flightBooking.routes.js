const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  bookFlight,
  getVendorFlightBookings,
  getMyFlightBookings,
  cancelFlightBooking,
} = require("../controllers/flightBooking.controller");

/* USER */
router.post("/book", protect, bookFlight);
router.get("/my", protect, getMyFlightBookings);
router.put("/cancel/:id", protect, cancelFlightBooking);

/* VENDOR */
router.get("/vendor", protect, getVendorFlightBookings);

module.exports = router;
