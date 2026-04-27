const mongoose = require("mongoose");

const homestayBookingSchema = new mongoose.Schema(
  {
    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // GUEST DETAILS
    guestName: String,
    guestEmail: String,
    guestPhone: String,

    // BOOKING DATES
    checkInDate: Date,
    checkOutDate: Date,
    nights: Number,

    // GUEST COUNT
    adults: Number,
    children: Number,

    // PRICE
    pricePerNight: Number,
    totalAmount: Number,

    // STATUS
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    bookingSource: {
      type: String,
      default: "website",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HomestayBooking",
  homestayBookingSchema
);
