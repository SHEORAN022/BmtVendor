const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomType: String,
  price: Number,
  capacity: Number,
  available: Boolean,
  images: [String]   // room images
});

const palaceSchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: true
    },

    description: String,

    category: {
      type: String,
      default: "palace"
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    featured: {
      type: Boolean,
      default: false
    },

    ownerName: String,
    email: String,
    phone: String,
    password: String,

    country: String,
    state: String,
    city: String,
    fullAddress: String,

    latitude: Number,
    longitude: Number,

    totalRooms: Number,

    heritageCertified: {
      type: Boolean,
      default: false
    },

    /* ===== PALACE IMAGES ===== */
    images: [String],   // property images

    /* ===== ROOMS ===== */
    rooms: [roomSchema],

    weddingAllowed: {
      type: Boolean,
      default: false
    },

    eventAllowed: {
      type: Boolean,
      default: false
    },

    amenities: [String],

    basePrice: Number,
    weekendPrice: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Palace", palaceSchema);