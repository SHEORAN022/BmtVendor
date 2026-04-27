const mongoose = require("mongoose");

/* ================= ROOM TYPE ================= */

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  maxGuests: {
    type: Number,
    default: 2
  }
});


/* ================= DOCUMENTS ================= */

const documentsSchema = new mongoose.Schema({
  idProof: String,
  propertyProof: String,
  license: String
});


/* ================= MAIN BNB SCHEMA ================= */

const bnbSchema = new mongoose.Schema({

  /* BASIC */

  propertyId: {
    type: String,
    unique: true,
    default: () => "BNB-" + Date.now()
  },

  propertyName: {
    type: String,
    required: true
  },

  tagline: String,

  description: String,

  propertyType: {
    type: String,
    default: "Bed & Breakfast"
  },

  starCategory: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },

  establishedYear: Number,


  /* OWNER */

  ownerName: {
    type: String,
    required: true
  },

  companyName: String,

  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Enter valid phone number"]
  },

  alternateContact: String,

  email: {
    type: String,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Enter valid email"]
  },

  website: String,

  password: {
    type: String,
    select: false
  },


  /* LOCATION */

  street: String,
  area: String,

  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  country: {
    type: String,
    default: "India"
  },

  pincode: String,
  landmark: String,

  latitude: Number,
  longitude: Number,


  /* ROOMS */

  totalRooms: Number,
  availableRooms: Number,
  maxGuests: Number,

  roomTypes: {
    type: [roomTypeSchema],
    default: []
  },


  /* PRICING */

  basePrice: Number,
  weekendPrice: Number,
  extraGuestCharge: Number,

  taxesIncluded: {
    type: Boolean,
    default: false
  },

  taxPercentage: Number,


  /* BREAKFAST */

  breakfastIncluded: {
    type: Boolean,
    default: true
  },

  lunchIncluded: Boolean,
  dinnerIncluded: Boolean,

  breakfastType: String,
  breakfastTiming: String,


  /* FACILITIES */

  amenities: {
    type: [String],
    default: []
  },

  parkingAvailable: Boolean,
  parkingType: String,

  petAllowed: Boolean,
  smokingAllowed: Boolean,
  alcoholAllowed: Boolean,

  powerBackup: Boolean,
  wifiSpeed: String,

  coupleFriendly: Boolean,


  /* POLICIES */

  checkIn: String,
  checkOut: String,

  earlyCheckInAllowed: Boolean,
  lateCheckOutAllowed: Boolean,


  /* BOOKING */

  instantBooking: {
    type: Boolean,
    default: true
  },

  minimumStay: Number,
  maximumStay: Number,

  cancellationPolicy: String,
  cancellationDays: Number,


  /* BANK */

  accountHolder: String,
  accountNumber: String,
  ifsc: String,
  bankName: String,

  gstNumber: String,
  panNumber: String,


  /* MEDIA */

  propertyImages: {
    type: [String],
    default: []
  },

  frontImages: {
    type: [String],
    default: []
  },

  receptionImages: {
    type: [String],
    default: []
  },

  videoPath: String,
  brochureUrl: String,


  /* DOCUMENTS */

  documents: {
    type: documentsSchema,
    default: {}
  },


  /* ADMIN */

  isActive: {
    type: Boolean,
    default: true
  },

  isApproved: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  }

},
{
  timestamps: true
});


/* ================= INDEXES ================= */

bnbSchema.index({ city: 1, state: 1 });
bnbSchema.index({ latitude: 1, longitude: 1 });


module.exports = mongoose.model("BnbProperty", bnbSchema);