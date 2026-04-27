const HolidayBooking = require("../models/HolidayBooking.model");
const HolidayPackage = require("../models/HolidayPackage.model");

/* ===== USER CREATE BOOKING ===== */
exports.createBooking = async (req, res) => {
  try {
    const holiday = await HolidayPackage.findById(req.body.holidayId);

    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    const total =
      req.body.travellers.adults * holiday.pricing.perPerson;

    const booking = await HolidayBooking.create({
      holiday: holiday._id,
      vendor: holiday.vendor,

      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone,

      travellers: req.body.travellers,
      travelDate: req.body.travelDate,

      pricePerPerson: holiday.pricing.perPerson,
      totalAmount: total,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===== VENDOR BOOKINGS ===== */
exports.getVendorBookings = async (req, res) => {
  const bookings = await HolidayBooking.find({
    vendor: req.vendor._id,
  })
    .populate("holiday", "title destination duration")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
};

/* ===== UPDATE STATUS ===== */
exports.updateBookingStatus = async (req, res) => {
  const booking = await HolidayBooking.findById(req.params.id);
  booking.status = req.body.status;
  await booking.save();

  res.json({ success: true, data: booking });
};
