const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
  homestay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Homestay",
    required: true,
    index: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HomestayBooking",
  },

  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
  },

  title: String,
  comment: { type: String, required: true },

  tripType: {
    type: String,
    enum: ["solo", "couple", "family", "friends"],
  },

  images: [String],

  vendorReply: {
    text: String,
    repliedAt: Date,
  },

  isApproved: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  flagged: { type: Boolean, default: false },

  helpfulVotes: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
},
{ timestamps: true }
);

reviewSchema.index({ homestay: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("HomestayReview", reviewSchema);