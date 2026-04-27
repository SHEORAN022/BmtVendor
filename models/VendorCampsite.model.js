const mongoose = require("mongoose");

const vendorCampsiteSchema = new mongoose.Schema(
{
  // 🔑 OWNER
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  /* ================= BASIC ================= */
  campsiteName: { type: String, required: true },
  description: String,
  shortDescription: String,
  category: { type: String, default: "Camping" },
  tags: [String],

  /* ================= LOCATION ================= */
  address: {
    street: String,
    area: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
    landmark: String
  },

  location: {
    latitude: String,
    longitude: String
  },

  /* ================= PRICING ================= */
  price: {
    perNight: Number,
    weekendPrice: Number,
    childPrice: Number,
    extraPersonPrice: Number
  },

  /* ================= CAMP DETAILS ================= */
  campType: String,
  totalTents: Number,
  availableTents: Number,
  maxGuests: Number,

  checkInTime: String,
  checkOutTime: String,

  /* ================= FEATURES ================= */
  amenities: [String],
  activities: [String],
  rules: [String],

  /* ================= FOOD ================= */
  foodAvailable: Boolean,
  foodType: String,

  /* ================= MEDIA ================= */
  thumbnailImage: String,
  images: [String],

  /* ================= CONTACT ================= */
  contactNumber: String,
  email: String,

  /* ================= STATUS ================= */
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "inactive"],
    default: "pending"
  },

  /* ================= META ================= */
  notes: String

},
{ timestamps: true }
);

module.exports = mongoose.model("VendorCampsite", vendorCampsiteSchema);