const DarshanBooking = require("../models/DarshanBooking");
const VendorDarshan = require("../models/VendorDarshan");

/* ================= USER BOOK DARSHAN ================= */
exports.bookDarshan = async (req, res) => {
  try {
    const { darshanId, seats } = req.body;

    const darshan = await VendorDarshan.findById(darshanId);
    if (!darshan)
      return res.status(404).json({ message: "Darshan not found" });

    if (darshan.availableSeats < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // 🔽 Reduce seats
    darshan.availableSeats -= seats;
    await darshan.save();

    const booking = await DarshanBooking.create({
      darshan: darshan._id,
      vendor: darshan.vendor,
      user: req.user._id,
      seats,
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= USER CANCEL BOOKING ================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await DarshanBooking.findById(req.params.id);
    if (!booking || booking.status === "cancelled")
      return res.status(400).json({ message: "Invalid booking" });

    booking.status = "cancelled";
    await booking.save();

    // 🔼 Restore seats
    const darshan = await VendorDarshan.findById(booking.darshan);
    darshan.availableSeats += booking.seats;
    await darshan.save();

    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= VENDOR VIEW BOOKINGS ================= */
exports.getVendorBookings = async (req, res) => {
  const data = await DarshanBooking.find({
    vendor: req.vendor._id,
  })
    .populate("user", "name email phone")
    .populate("darshan", "name date time");

  res.json({ success: true, data });
};
