const HomestayBooking = require("../models/HomestayBooking.model");
const Homestay = require("../models/Homestay.model");

/* ================= USER CREATE BOOKING ================= */
exports.createBooking = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.body.homestayId);

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    const nights =
      (new Date(req.body.checkOutDate) -
        new Date(req.body.checkInDate)) /
      (1000 * 60 * 60 * 24);

    const totalAmount =
      nights * homestay.pricing.basePrice;

    const booking = await HomestayBooking.create({
      homestay: homestay._id,
      vendor: homestay.vendor,
      user: req.user?._id,

      guestName: req.body.guestName,
      guestEmail: req.body.guestEmail,
      guestPhone: req.body.guestPhone,

      checkInDate: req.body.checkInDate,
      checkOutDate: req.body.checkOutDate,
      nights,

      adults: req.body.adults,
      children: req.body.children,

      pricePerNight: homestay.pricing.basePrice,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= VENDOR BOOKINGS ================= */
exports.getVendorBookings = async (req, res) => {
  const bookings = await HomestayBooking.find({
    vendor: req.vendor._id,
  })
    .populate("homestay", "propertyName city")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bookings,
  });
};

/* ================= UPDATE STATUS ================= */
exports.updateBookingStatus = async (req, res) => {
  const booking = await HomestayBooking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  booking.status = req.body.status;
  await booking.save();

  res.json({
    success: true,
    data: booking,
  });
};
