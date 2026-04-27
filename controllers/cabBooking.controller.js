
const Cab = require("../models/Cab.model");
const CabBooking = require("../models/CabBooking.model");

/* =====================================================
   👤 USER: SEARCH CABS
   ===================================================== */
exports.searchCabs = async (req, res) => {
  const { fromCity, toCity } = req.query;

  const cabs = await Cab.find({
    fromCity,
    toCity,
    availableSeats: { $gt: 0 },
    isActive: true,
  });

  res.json(cabs);
};

/* =====================================================
   👤 USER: BOOK CAB
   ===================================================== */
exports.bookCab = async (req, res) => {
  const { cabId, seatsBooked, pickupLocation, dropLocation } = req.body;

  const cab = await Cab.findById(cabId);
  if (!cab) return res.status(404).json({ message: "Cab not found" });

  if (cab.availableSeats < seatsBooked) {
    return res.status(400).json({ message: "Not enough seats available" });
  }

  cab.availableSeats -= seatsBooked;
  await cab.save();

  const booking = await CabBooking.create({
    user: req.user._id,
    cab: cabId,
    pickupLocation,
    dropLocation,
    seatsBooked,
    totalPrice: seatsBooked * cab.price,
  });

  res.json({ success: true, booking });
};

/* =====================================================
   👤 USER: MY CAB BOOKINGS
   ===================================================== */
exports.getUserCabBookings = async (req, res) => {
  const bookings = await CabBooking.find({ user: req.user._id })
    .populate("cab")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* =====================================================
   👤 USER: CANCEL CAB BOOKING
   ===================================================== */
exports.cancelCabBooking = async (req, res) => {
  const booking = await CabBooking.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("cab");

  if (!booking)
    return res.status(404).json({ message: "Booking not found" });

  if (booking.status === "cancelled")
    return res.status(400).json({ message: "Already cancelled" });

  booking.status = "cancelled";
  await booking.save();

  // seats wapas add
  booking.cab.availableSeats += booking.seatsBooked;
  await booking.cab.save();

  res.json({ success: true, message: "Booking cancelled" });
};

/* =====================================================
   👨‍💼 VENDOR: VIEW CAB BOOKINGS
   ===================================================== */
exports.getVendorCabBookings = async (req, res) => {
  const bookings = await CabBooking.find()
    .populate({
      path: "cab",
      match: { vendor: req.vendor._id },
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  // null cabs filter (other vendors)
  const filtered = bookings.filter((b) => b.cab);

  res.json(filtered);
};
