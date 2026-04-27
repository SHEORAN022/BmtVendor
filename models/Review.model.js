const mongoose = require("mongoose");

/* ─────────────────────────────────────────────
   REVIEW SCHEMA
───────────────────────────────────────────── */
const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Hotel",
      required: true,
      index:    true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Booking",
    },

    // ── Ratings (1–5 each) ──
    ratings: {
      overall:     { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      comfort:     { type: Number, min: 1, max: 5 },
      location:    { type: Number, min: 1, max: 5 },
      facilities:  { type: Number, min: 1, max: 5 },
      staff:       { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },

    // ── Review Content ──
    title:   { type: String, maxlength: 120 },
    comment: { type: String, required: true, maxlength: 2000 },

    // ── Trip Details ──
    tripType: {
      type: String,
      enum: ["solo", "couple", "family", "business", "friends"],
    },
    stayedIn: String, // room type name

    // ── Media ──
    images: [String],

    // ── Vendor Response ──
    vendorReply: {
      text:      String,
      repliedAt: Date,
    },

    // ── Moderation ──
    isApproved: { type: Boolean, default: false },
    isVisible:  { type: Boolean, default: true },
    flagged:    { type: Boolean, default: false },

    // ── Helpful votes ──
    helpfulVotes: { type: Number, default: 0 },
    helpfulBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// One review per user per hotel
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

/* ─────────────────────────────────────────────
   STATIC — recalculate hotel averageRating
───────────────────────────────────────────── */
reviewSchema.statics.recalcHotelRating = async function (hotelId) {
  const Hotel = mongoose.model("Hotel");

  const stats = await this.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId), isApproved: true } },
    {
      $group: {
        _id:           "$hotel",
        avgOverall:    { $avg: "$ratings.overall" },
        avgClean:      { $avg: "$ratings.cleanliness" },
        avgComfort:    { $avg: "$ratings.comfort" },
        avgLocation:   { $avg: "$ratings.location" },
        avgFacilities: { $avg: "$ratings.facilities" },
        avgStaff:      { $avg: "$ratings.staff" },
        avgValue:      { $avg: "$ratings.valueForMoney" },
        total:         { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    const s = stats[0];
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: Math.round(s.avgOverall * 10) / 10,
      totalReviews:  s.total,
      ratingBreakdown: {
        cleanliness:    Math.round((s.avgClean    || 0) * 10) / 10,
        comfort:        Math.round((s.avgComfort  || 0) * 10) / 10,
        location:       Math.round((s.avgLocation || 0) * 10) / 10,
        facilities:     Math.round((s.avgFacilities || 0) * 10) / 10,
        staff:          Math.round((s.avgStaff    || 0) * 10) / 10,
        valueForMoney:  Math.round((s.avgValue    || 0) * 10) / 10,
      },
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: 0,
      totalReviews:  0,
    });
  }
};

/* auto-recalc on save & delete */
reviewSchema.post("save", function () {
  this.constructor.recalcHotelRating(this.hotel);
});
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.recalcHotelRating(doc.hotel);
});

module.exports = mongoose.model("Review", reviewSchema);