const Flight = require("../models/Flight.model");
const FlightBooking = require("../models/FlightBooking.model");

/* 📌 BOOK FLIGHT */
exports.bookFlight = async (req, res) => {
  const { flightId, seatNumber } = req.body;

  const flight = await Flight.findById(flightId);
  if (!flight) return res.status(404).json({ message: "Flight not found" });

  if (flight.bookedSeats.includes(seatNumber)) {
    return res.status(400).json({ message: "Seat already booked" });
  }

  flight.bookedSeats.push(seatNumber);
  await flight.save();

  const booking = await FlightBooking.create({
    user: req.user._id,
    flight: flightId,
    seatNumber,
  });

  res.json({ success: true, booking });
};

/* 👨‍💼 VENDOR – VIEW BOOKINGS */
exports.getVendorFlightBookings = async (req, res) => {
  const bookings = await FlightBooking.find()
    .populate({
      path: "flight",
      match: { vendor: req.vendor._id },
    })
    .populate("user", "name email");

  res.json(bookings.filter((b) => b.flight));
};

/* 👤 USER – MY BOOKINGS */
exports.getMyFlightBookings = async (req, res) => {
  const bookings = await FlightBooking.find({ user: req.user._id })
    .populate("flight");

  res.json(bookings);
};

/* ❌ CANCEL BOOKING */
exports.cancelFlightBooking = async (req, res) => {
  const booking = await FlightBooking.findById(req.params.id).populate("flight");

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.status = "cancelled";
  await booking.save();

  booking.flight.bookedSeats =
    booking.flight.bookedSeats.filter(
      (s) => s !== booking.seatNumber
    );

  await booking.flight.save();

  res.json({ success: true, message: "Booking cancelled" });
};
