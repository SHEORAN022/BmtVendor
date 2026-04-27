const mongoose = require("mongoose");

const darshanBookingSchema = new mongoose.Schema(
  {
    darshan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorDarshan",
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
      required: true,
    },

    seats: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DarshanBooking", darshanBookingSchema);
