const Bus = require("../models/Bus.model");
const BusBooking = require("../models/BusBooking.model");

/* ================= 📌 BOOK BUS ================= */
exports.bookBus = async (req, res) => {
  try {
    const { busId, seatNumber } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    if (bus.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // ✅ Create booking record
    const booking = await BusBooking.create({
      user: req.user._id,
      bus: busId,
      seatNumber,
    });

    // ✅ Mark seat booked
    bus.bookedSeats.push(seatNumber);
    await bus.save();

    res.json({
      success: true,
      message: "Booking confirmed",
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ❌ CANCEL BUS BOOKING ================= */
exports.cancelBusBooking = async (req, res) => {
  try {
    const booking = await BusBooking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("bus");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    // free seat
    booking.bus.bookedSeats = booking.bus.bookedSeats.filter(
      (s) => s !== booking.seatNumber
    );
    await booking.bus.save();

    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= 👤 USER – MY BOOKINGS ================= */
exports.getUserBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find({ user: req.user._id })
      .populate(
        "bus",
        "busName busNumber fromCity toCity travelDate departureTime arrivalTime price image"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= 👨‍💼 VENDOR – BUS BOOKINGS ================= */
exports.getVendorBusBookings = async (req, res) => {
  try {
    const bookings = await BusBooking.find()
      .populate({
        path: "bus",
        match: { vendor: req.vendor._id },
        select: "busName busNumber fromCity toCity travelDate price",
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const vendorBookings = bookings.filter((b) => b.bus !== null);

    res.json({ success: true, bookings: vendorBookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
