const mongoose = require("mongoose");

const vendorDarshanSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    name: String,
    location: String,
    date: Date,
    time: String,
    description: String,
    price: Number,
    availableSeats: Number,

    images: [String], // 🔥 cloudinary URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorDarshan", vendorDarshanSchema);
