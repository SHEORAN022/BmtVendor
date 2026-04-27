const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
{
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  hotel:  { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },

  name: { type: String, required: true },
  type: { type: String, enum: ["basic", "early", "last", "long"], required: true },

  discountType: { type: String, enum: ["percent", "flat"], default: "percent" },
  discountValue: { type: Number, required: true },

  minStay: Number,
  maxStay: Number,

  advanceDays: Number,     // early bird
  lastMinuteDays: Number,  // last minute

  startDate: Date,
  endDate: Date,

  days: [String], // ["Mon","Tue"]

  status: { type: String, enum: ["active", "inactive"], default: "active" },
},
{ timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);