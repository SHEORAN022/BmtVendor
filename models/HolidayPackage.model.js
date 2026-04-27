const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  day: Number,
  title: String,
  description: String,
  meals: [String],
  sightseeing: [String],
});

const holidayPackageSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    /* ===== BASIC INFO ===== */
    title: { type: String, required: true },
    destination: { type: String, required: true },
    country: { type: String, default: "India" },
    duration: { type: String, required: true },
    packageType: {
      type: String,
      enum: ["Domestic", "International"],
      default: "Domestic",
    },
    category: {
      type: String,
      enum: ["Budget", "Premium", "Luxury"],
      default: "Budget",
    },
    overview: String,

    /* ===== PRICING ===== */
    pricing: {
      perPerson: Number,
      discountPrice: Number,
      childPrice: Number,
      extraAdultPrice: Number,
      singleOccupancyPrice: Number,
      currency: { type: String, default: "INR" },
      taxesIncluded: { type: Boolean, default: true },
    },

    /* ===== ITINERARY ===== */
    itinerary: [itinerarySchema],

    /* ===== INCLUSIONS ===== */
    inclusions: [String],
    exclusions: [String],

    /* ===== MEDIA ===== */
    bannerImage: String,
    galleryImages: [String],

    /* ===== VALIDITY ===== */
    validFrom: Date,
    validTill: Date,

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HolidayPackage", holidayPackageSchema);
