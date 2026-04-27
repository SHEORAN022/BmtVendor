const Review  = require("../models/Review.model");
const Hotel   = require("../models/Hotel.model");
const cloudinary = require("../config/cloudinary");

/* ─── helpers ─── */
const uploadMany = async (files, folder) => {
  const urls = [];
  for (const f of files) {
    const r = await cloudinary.uploader.upload(f.path, { folder });
    urls.push(r.secure_url);
  }
  return urls;
};

/* ═══════════════════════════════════════════════
   ADD REVIEW  (user)
   POST /api/reviews
   Body: { hotelId, ratings{overall,cleanliness,...}, title, comment, tripType, stayedIn }
   Files: images[] (optional, max 5)
═══════════════════════════════════════════════ */
exports.addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      hotelId, title, comment, tripType, stayedIn, bookingId,
      overall, cleanliness, comfort, location, facilities, staff, valueForMoney,
    } = req.body;

    if (!hotelId)  return res.status(400).json({ message: "hotelId is required" });
    if (!overall)  return res.status(400).json({ message: "Overall rating is required" });
    if (!comment)  return res.status(400).json({ message: "Review comment is required" });

    // Check hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Check duplicate
    const existing = await Review.findOne({ hotel: hotelId, user: userId });
    if (existing) return res.status(400).json({ message: "You have already reviewed this hotel" });

    // Upload images
    let images = [];
    if (req.files?.images?.length) {
      if (req.files.images.length > 5)
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      images = await uploadMany(req.files.images, "reviews");
    }

    const review = await Review.create({
      hotel:   hotelId,
      user:    userId,
      booking: bookingId || undefined,
      ratings: {
        overall:      Number(overall),
        cleanliness:  cleanliness  ? Number(cleanliness)  : undefined,
        comfort:      comfort      ? Number(comfort)      : undefined,
        location:     location     ? Number(location)     : undefined,
        facilities:   facilities   ? Number(facilities)   : undefined,
        staff:        staff        ? Number(staff)        : undefined,
        valueForMoney: valueForMoney ? Number(valueForMoney) : undefined,
      },
      title, comment, tripType, stayedIn, images,
      isApproved: false, // admin approves
    });

    await review.populate("user", "name avatar");

    res.status(201).json({ success: true, message: "Review submitted for approval", review });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "You have already reviewed this hotel" });
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   GET REVIEWS FOR A HOTEL  (public)
   GET /api/reviews/hotel/:hotelId
   Query: page, limit, sort (recent|highest|lowest|helpful), tripType, minRating
═══════════════════════════════════════════════ */
exports.getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      page     = 1,
      limit    = 10,
      sort     = "recent",
      tripType,
      minRating,
    } = req.query;

    const filter = { hotel: hotelId, isApproved: true, isVisible: true };
    if (tripType)  filter.tripType = tripType;
    if (minRating) filter["ratings.overall"] = { $gte: Number(minRating) };

    const sortMap = {
      recent:   { createdAt: -1 },
      highest:  { "ratings.overall": -1 },
      lowest:   { "ratings.overall": 1 },
      helpful:  { helpfulVotes: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.recent;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user", "name avatar")
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Rating summary
    const summary = await Review.aggregate([
      { $match: { hotel: new (require("mongoose").Types.ObjectId)(hotelId), isApproved: true } },
      {
        $group: {
          _id:  null,
          avg:  { $avg: "$ratings.overall" },
          total: { $sum: 1 },
          r5: { $sum: { $cond: [{ $gte: ["$ratings.overall", 4.5] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $and: [{ $gte: ["$ratings.overall", 3.5] }, { $lt: ["$ratings.overall", 4.5] }] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $and: [{ $gte: ["$ratings.overall", 2.5] }, { $lt: ["$ratings.overall", 3.5] }] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $and: [{ $gte: ["$ratings.overall", 1.5] }, { $lt: ["$ratings.overall", 2.5] }] }, 1, 0] } },
          r1: { $sum: { $cond: [{ $lt: ["$ratings.overall", 1.5] }, 1, 0] } },
          avgClean:    { $avg: "$ratings.cleanliness" },
          avgComfort:  { $avg: "$ratings.comfort" },
          avgLocation: { $avg: "$ratings.location" },
          avgFacilities: { $avg: "$ratings.facilities" },
          avgStaff:    { $avg: "$ratings.staff" },
          avgValue:    { $avg: "$ratings.valueForMoney" },
        },
      },
    ]);

    res.json({
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      summary: summary[0] || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   GET MY REVIEW for a hotel  (user)
   GET /api/reviews/my/:hotelId
═══════════════════════════════════════════════ */
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      hotel: req.params.hotelId,
      user:  req.user._id,
    }).populate("user", "name avatar");
    res.json({ review: review || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   UPDATE REVIEW  (user — own review only)
   PUT /api/reviews/:reviewId
═══════════════════════════════════════════════ */
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const {
      overall, cleanliness, comfort, location, facilities, staff, valueForMoney,
      title, comment, tripType, stayedIn,
    } = req.body;

    if (overall)       review.ratings.overall      = Number(overall);
    if (cleanliness)   review.ratings.cleanliness  = Number(cleanliness);
    if (comfort)       review.ratings.comfort       = Number(comfort);
    if (location)      review.ratings.location      = Number(location);
    if (facilities)    review.ratings.facilities    = Number(facilities);
    if (staff)         review.ratings.staff         = Number(staff);
    if (valueForMoney) review.ratings.valueForMoney = Number(valueForMoney);

    if (title)    review.title    = title;
    if (comment)  review.comment  = comment;
    if (tripType) review.tripType = tripType;
    if (stayedIn) review.stayedIn = stayedIn;

    // Append new images
    if (req.files?.images?.length) {
      const newImgs = await uploadMany(req.files.images, "reviews");
      review.images.push(...newImgs);
    }

    review.isApproved = false; // re-approve after edit
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   DELETE REVIEW  (user — own review only)
   DELETE /api/reviews/:reviewId
═══════════════════════════════════════════════ */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   MARK HELPFUL  (user)
   POST /api/reviews/:reviewId/helpful
═══════════════════════════════════════════════ */
exports.markHelpful = async (req, res) => {
  try {
    const userId   = req.user._id;
    const review   = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const alreadyVoted = review.helpfulBy.includes(userId);

    if (alreadyVoted) {
      review.helpfulBy   = review.helpfulBy.filter(id => !id.equals(userId));
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.json({ success: true, helpfulVotes: review.helpfulVotes, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   VENDOR REPLY  (vendor)
   POST /api/reviews/:reviewId/reply
   Body: { text }
═══════════════════════════════════════════════ */
exports.vendorReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text is required" });

    // Vendor can only reply to reviews of their hotels
    const review = await Review.findById(req.params.reviewId).populate("hotel", "vendor");
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (!review.hotel.vendor.equals(req.vendor._id))
      return res.status(403).json({ message: "Not authorized" });

    review.vendorReply = { text, repliedAt: new Date() };
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   GET ALL REVIEWS FOR VENDOR'S HOTELS  (vendor dashboard)
   GET /api/reviews/vendor
   Query: page, limit, status (pending|approved|all), hotelId
═══════════════════════════════════════════════ */
exports.getVendorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all", hotelId } = req.query;

    // Get vendor's hotel IDs
    const hotels = hotelId
      ? [hotelId]
      : (await Hotel.find({ vendor: req.vendor._id }).select("_id")).map(h => h._id);

    const filter = { hotel: { $in: hotels } };
    if (status === "pending")  filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user",  "name avatar")
        .populate("hotel", "hotelName")
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   ADMIN — APPROVE / REJECT / FLAG
   PATCH /api/reviews/:reviewId/moderate
   Body: { action: "approve" | "reject" | "flag" }
═══════════════════════════════════════════════ */
exports.moderateReview = async (req, res) => {
  try {
    const { action } = req.body;
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (action === "approve") { review.isApproved = true;  review.isVisible = true;  }
    if (action === "reject")  { review.isApproved = false; review.isVisible = false; }
    if (action === "flag")    { review.flagged = true; }

    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════════
   ADMIN — GET ALL REVIEWS
   GET /api/reviews/admin
   Query: page, limit, approved, flagged, hotelId
═══════════════════════════════════════════════ */
exports.adminGetReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, approved, flagged, hotelId } = req.query;
    const filter = {};
    if (hotelId)  filter.hotel      = hotelId;
    if (approved !== undefined) filter.isApproved = approved === "true";
    if (flagged  !== undefined) filter.flagged    = flagged  === "true";

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user",  "name avatar email")
        .populate("hotel", "hotelName city")
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};