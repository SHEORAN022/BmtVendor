
const mongoose = require("mongoose");

/* =====================================================
   ROOM SCHEMA (42+ FIELDS)
===================================================== */
const roomSchema = new mongoose.Schema(
  {
    roomType:          { type: String, required: true },
    roomName:          String,
    description:       String,
    floorNumber:       String,
    roomSize:          String,
    viewType:          String,

    // Pricing
    basePrice:         { type: Number, required: true },
    offerPrice:        Number,
    tax:               Number,
    serviceCharge:     Number,

    // Capacity
    totalRooms:        { type: Number, required: true },
    availableRooms:    { type: Number, required: true },
    maxGuests:         Number,
    adults:            Number,
    children:          Number,

    // Bed
    bedType:           String,
    bedCount:          Number,
    extraBedAvailable: Boolean,
    extraBedCharge:    Number,

    // Room Features
    balcony:           Boolean,
    airCondition:      Boolean,
    heater:            Boolean,
    wifi:              Boolean,
    tv:                Boolean,
    minibar:           Boolean,
    wardrobe:          Boolean,
    workDesk:          Boolean,
    iron:              Boolean,
    kitchen:           Boolean,

    // Bathroom
    bathroomType:      String,
    bathtub:           Boolean,
    shower:            Boolean,
    toiletries:        Boolean,
    hairDryer:         Boolean,

    // Meals
    breakfastIncluded: Boolean,
    lunchIncluded:     Boolean,
    dinnerIncluded:    Boolean,

    // Policies
    smokingAllowed:    Boolean,
    refundable:        Boolean,
    cancellationPolicy:String,

    // Media
    images: [String],

    status: {
      type:    String,
      enum:    ["available", "soldout"],
      default: "available",
    },
  },
  { timestamps: true }
);

/* =====================================================
   HOTEL SCHEMA (53+ FIELDS)
===================================================== */
const hotelSchema = new mongoose.Schema(
  {
    vendor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Vendor",
      required: true,
    },

    // Basic Info
    hotelName:   { type: String, required: true },
    hotelType:   String,
    description: String,
    starRating:  Number,
    yearBuilt:   Number,

    // Contact
    phone:          String,
    alternatePhone: String,
    email:          String,
    website:        String,

    // Address
    country:  { type: String, default: "India" },
    state:    String,
    city:     String,
    area:     String,
    address:  String,
    pincode:  String,
    landmark: String,

    // Geo Location
    location: {
      type: {
        type:    String,
        enum:    ["Point"],
        default: "Point",
      },
      coordinates: {
        type:    [Number],
        default: [0, 0],
      },
    },

    // Facilities
    amenities:          [String],
    propertyHighlights: [String],
    foodAndDining:      [String],
    safetyAndSecurity:  [String],
    wellnessAndSpa:     [String],
    businessFacilities: [String],
    mediaAndTechnology: [String],
    transportServices:  [String],

    // Rooms
    rooms: [roomSchema],

    // Media
    hotelImages:    [String],
    roomImages:     [String],
    videos:         [String],
    virtualTourLink:String,

    // Policies
    checkInTime:          String,
    checkOutTime:         String,
    earlyCheckInAllowed:  Boolean,
    lateCheckOutAllowed:  Boolean,
    cancellationPolicy:   String,
    childPolicy:          String,
    petPolicy:            String,
    coupleFriendly:       { type: Boolean, default: true },
    localIdAllowed:       { type: Boolean, default: true },

    // Pricing
    pricePerNight:  Number,
    taxPercentage:  Number,
    serviceCharge:  Number,
    extraBedCharge: Number,
    paymentMethods: [String],
    refundPolicy:   String,
    gstNumber:      String,

    // Stats
    averageRating: { type: Number, default: 0 },
    totalReviews:  { type: Number, default: 0 },

    // Meta
    vendorId:   String,
    vendorName: String,
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hotel", hotelSchema);