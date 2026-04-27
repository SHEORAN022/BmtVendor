const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // ================= BASIC INFO =================
    apartmentName: { type: String, required: true },
    propertyType: { type: String, default: "Apartment" },
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

    // ================= BUILDING DETAILS =================
    buildingName: String,
    towerName: String,
    floorNumber: String,
    totalFloors: String,
    flatNumber: String,
    societyName: String,

    // ================= APARTMENT DETAILS =================
    apartmentType: {
      type: String,
      enum: ["Studio", "1BHK", "2BHK", "3BHK", "4BHK", "Penthouse"],
      default: "1BHK",
    },
    furnishing: {
      type: String,
      enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
      default: "Fully Furnished",
    },
    carpetArea: String,
    superArea: String,
    bedrooms: Number,
    hall: Number,
    kitchen: Number,
    bathrooms: Number,
    balcony: Number,
    maxGuests: Number,
    beds: Number,

    // ================= CAPACITY EXTRAS =================
    extraMattressAllowed: { type: Boolean, default: false },
    childrenAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },

    // ================= CHECK IN / OUT =================
    checkInTime: String,
    checkOutTime: String,

    // ================= AMENITIES =================
    amenities: [String],

    // ================= FOOD =================
    kitchenAvailable: { type: Boolean, default: false },
    selfCookingAllowed: { type: Boolean, default: false },
    vegFoodAvailable: { type: Boolean, default: false },
    nonVegAllowed: { type: Boolean, default: false },

    // ================= PRICING =================
    pricing: {
      basePrice: Number,       // per night
      monthlyPrice: Number,    // per month
      weekendPrice: Number,
      extraGuestPrice: Number,
      cleaningFee: Number,
      securityDeposit: Number,
    },

    // ================= ROOM INFO =================
    roomType: {
      type: String,
      enum: ["Entire Apartment", "Private Room", "Shared Room"],
      default: "Entire Apartment",
    },
    mealPlan: String,

    // ================= AVAILABILITY =================
    availableFrom: Date,
    availableTo: Date,

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
    // pending → approved/rejected (admin manages; vendor can toggle active/inactive after approval)
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

module.exports = mongoose.model("VendorApartment", apartmentSchema);