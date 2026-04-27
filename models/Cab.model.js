

// module.exports = mongoose.model("Cab", cabSchema);
const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    cabType: {
      type: String,
      enum: ["Mini", "Sedan", "SUV"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },

    fromCity: {
      type: String,
      required: true,
    },

    toCity: {
      type: String,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // ⭐ MAIN IMAGE
    image: {
      type: String,
      required: true,
    },

    // 🖼️ GALLERY (0–10 images)
    gallery: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
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

module.exports = mongoose.model("Cab", cabSchema);
