const Hotel = require("../models/Hotel.model");
const HotelBooking = require("../models/HotelBooking.model");

/* ======================================================
   📌 USER – BOOK HOTEL
   ====================================================== */
exports.bookHotel = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const totalPrice = nights * rooms * hotel.pricePerNight;

    const booking = await HotelBooking.create({
      user: req.user._id,
      hotel: hotel._id,
      vendor: hotel.vendor,
      checkIn,
      checkOut,
      rooms,
      totalPrice,
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   👤 USER – MY BOOKINGS
   ====================================================== */
exports.getUserHotelBookings = async (req, res) => {
  const bookings = await HotelBooking.find({ user: req.user._id })
    .populate("hotel", "name location image")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* ======================================================
   👨‍💼 VENDOR – HOTEL BOOKINGS
   ====================================================== */
exports.getVendorHotelBookings = async (req, res) => {
  const bookings = await HotelBooking.find({ vendor: req.vendor._id })
    .populate("hotel", "name location")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* ======================================================
   ❌ USER – CANCEL BOOKING
   ====================================================== */
exports.cancelHotelBooking = async (req, res) => {
  const booking = await HotelBooking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!booking)
    return res.status(404).json({ message: "Booking not found" });

  booking.status = "cancelled";
  await booking.save();

  res.json({ success: true, message: "Booking cancelled" });
};
