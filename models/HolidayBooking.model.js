const mongoose = require("mongoose");

const holidayBookingSchema = new mongoose.Schema(
  {
    holiday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayPackage",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    /* USER INFO */
    userName: String,
    userEmail: String,
    userPhone: String,

    /* TRAVELLERS */
    travellers: {
      adults: Number,
      children: Number,
    },

    travelDate: Date,

    /* PRICING */
    pricePerPerson: Number,
    totalAmount: Number,

    /* STATUS */
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HolidayBooking", holidayBookingSchema);
