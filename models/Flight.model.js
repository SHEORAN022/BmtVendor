
const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    flightName: {
      type: String,
      required: true,
    },

    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },

    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },

    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },

    travelDate: { type: Date, required: true },

    totalSeats: { type: Number, required: true },

    bookedSeats: {
      type: [String],
      default: [],
    },

    price: { type: Number, required: true },

    image: {
      type: String,
      required: true, // main image
    },

    /* 🖼️ GALLERY (MAX 10) */
    gallery: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 gallery images allowed",
      },
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flight", flightSchema);
