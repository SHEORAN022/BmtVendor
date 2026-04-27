const mongoose = require("mongoose");

const vacationHouseSchema = new mongoose.Schema(
{
  /* ===== BASIC INFO ===== */

  propertyName: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  shortDescription: {
    type: String
  },

  starRating: {
    type: Number,
    min: 1,
    max: 5
  },

  /* ===== LOCATION ===== */

  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,

    latitude: Number,
    longitude: Number
  },

  /* ===== OWNER ===== */

  owner: {
    ownerName: String,
    phone: String,
    alternatePhone: String,
    email: String
  },

  /* ===== PRICING ===== */

  pricing: {
    basePrice: Number,
    weekendPrice: Number,
    monthlyPrice: Number,
    cleaningFee: Number,
    securityDeposit: Number
  },

  /* ===== RULES ===== */

  checkInTime: String,
  checkOutTime: String,

  petsAllowed: {
    type: Boolean,
    default: false
  },

  smokingAllowed: {
    type: Boolean,
    default: false
  },

  cancellationPolicy: String,
  houseRules: String,

  /* ===== IMAGES ===== */

  images: {

    frontView: [String],

    bedRoom: [String],

    kitchen: [String],

    washroom: [String]

  },

  /* ===== DOCUMENTS ===== */

  documents: {

    propertyDocument: [String],

    ownerIdProof: [String],

    addressProof: [String],

    govtLicense: [String]

  },

  /* ===== VENDOR ===== */

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.models.VacationHouse || mongoose.model("VacationHouse", vacationHouseSchema);