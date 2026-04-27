
const mongoose = require("mongoose");

const homestaySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // ================= BASIC INFO =================
    propertyName: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["Homestay", "Villa", "Apartment", "Cottage", "Farmhouse"],
      required: true,
    },
    description: String,
    hostName: String,

    // ================= CONTACT =================
    phone: String,
    altPhone: String,
    email: String,

    // ================= LOCATION =================
    country: { type: String, default: "India" },
    state: String,
    city: String,
    area: String,
    address: String,
    pincode: String,
    landmark: String,
    mapLocation: {
      lat: String,
      lng: String,
    },

    // ================= CAPACITY =================
    maxGuests: Number,
    bedrooms: Number,
    bathrooms: Number,
    beds: Number,
    extraMattressAllowed: { type: Boolean, default: false },
    childrenAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },

    // ================= AMENITIES =================
    amenities: [String],

    // ================= FOOD =================
    kitchenAvailable: { type: Boolean, default: false },
    selfCookingAllowed: { type: Boolean, default: false },
    vegFoodAvailable: { type: Boolean, default: false },
    nonVegAllowed: { type: Boolean, default: false },

    // ================= PRICING =================
    pricing: {
      basePrice: Number,
      weekendPrice: Number,
      extraGuestPrice: Number,
      cleaningFee: Number,
      securityDeposit: Number,
    },

    // ================= CHECK IN / OUT =================
    checkInTime: String,
    checkOutTime: String,

    // ================= AVAILABILITY =================
    availableFrom: Date,
    availableTo: Date,

    // ================= ROOM INFO =================
    roomType: String,
    mealPlan: String,

    // ================= HOUSE RULES =================
    houseRules: {
      smoking: { type: Boolean, default: false },
      alcohol: { type: Boolean, default: false },
      parties: { type: Boolean, default: false },
      loudMusic: { type: Boolean, default: false },
      unmarriedCouples: { type: Boolean, default: false },
      localIdAllowed: { type: Boolean, default: false },
    },
    cancellationPolicy: String,

    // ================= MEDIA =================
    thumbnail: String,
    images: [String],

    // ================= STATUS =================
    // pending → approved/rejected (admin karta hai, vendor nahi dekh/change kar sakta)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "inactive"],
      default: "pending",
    },

    // ================= META =================
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homestay", homestaySchema);