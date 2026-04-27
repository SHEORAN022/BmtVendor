const mongoose = require("mongoose");

const motelVendorSchema = new mongoose.Schema(
{
  /* ================= BASIC INFO ================= */

  ownerName: {
    type: String,
    required: true,
    trim: true
  },

  companyName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true
  },

  alternatePhone: {
    type: String,
    default: ""
  },

  /* ================= ADDRESS ================= */

  street: {
    type: String,
    default: ""
  },

  area: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  state: {
    type: String,
    default: ""
  },

  country: {
    type: String,
    default: "India"
  },

  pincode: {
    type: String,
    default: ""
  },

  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  },

  /* ================= BUSINESS ================= */

  businessType: {
    type: String,
    default: "motel"
  },

  experienceYears: {
    type: String,
    default: ""
  },

  /* ================= DOCUMENTS ================= */

  gstNumber: {
    type: String,
    default: ""
  },

  panNumber: {
    type: String,
    default: ""
  },

  aadhaarNumber: {
    type: String,
    default: ""
  },

  gstImage: {
    type: String,
    default: ""
  },

  panImage: {
    type: String,
    default: ""
  },

  aadhaarImage: {
    type: String,
    default: ""
  },

  /* ================= BANK ================= */

  accountHolderName: {
    type: String,
    default: ""
  },

  bankName: {
    type: String,
    default: ""
  },

  accountNumber: {
    type: String,
    default: ""
  },

  ifscCode: {
    type: String,
    default: ""
  },

  /* ================= PROFILE ================= */

  profileImage: {
    type: String,
    default: ""
  },

  /* ================= ADMIN STATUS ================= */

  isApproved: {
    type: Boolean,
    default: true
  },

  addedByAdmin: {
    type: Boolean,
    default: true
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("MotelVendor", motelVendorSchema);