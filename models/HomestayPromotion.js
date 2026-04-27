const mongoose = require("mongoose");

const schema = new mongoose.Schema(
{
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

  homestay: {   // ✅ CHANGE
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homestay",
    required: true
  },

  name: { type: String, required: true },

  type: {
    type: String,
    enum: ["basic", "early", "last", "long"],
    required: true
  },

  discountType: {
    type: String,
    enum: ["percent", "flat"],
    default: "percent"
  },

  discountValue: { type: Number, required: true },

  minStay: Number,
  maxStay: Number,

  advanceDays: Number,
  lastMinuteDays: Number,

  startDate: Date,
  endDate: Date,

  days: [String],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("HomestayPromotion", schema);