const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  hotel:  { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },

  campaignName: { type: String, required: true },

  startDate: Date,
  endDate: Date,

  cpc: Number,
  clicks: Number,

  totalCost: Number,
  gst: Number,
  finalAmount: Number,

  paymentMethod: {
    type: String,
    enum: ["pay_now", "adjustment"],
    default: "adjustment",
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  }

}, { timestamps: true });

module.exports = mongoose.model("SponsoredCampaign", schema);