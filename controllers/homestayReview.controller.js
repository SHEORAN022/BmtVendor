const Review = require("../models/HomestayReview.model");
const Homestay = require("../models/Homestay.model");
const cloudinary = require("../config/cloudinary");

/* upload helper */
const uploadMany = async (files, folder) => {
  const urls = [];
  for (const f of files) {
    const r = await cloudinary.uploader.upload(f.path, { folder });
    urls.push(r.secure_url);
  }
  return urls;
};

/* ADD REVIEW */
exports.addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { homestayId, comment, overall } = req.body;

    if (!homestayId || !overall || !comment)
      return res.status(400).json({ message: "Missing fields" });

    const homestay = await Homestay.findById(homestayId);
    if (!homestay) return res.status(404).json({ message: "Not found" });

    const exists = await Review.findOne({ homestay: homestayId, user: userId });
    if (exists) return res.status(400).json({ message: "Already reviewed" });

    let images = [];
    if (req.files?.images) {
      images = await uploadMany(req.files.images, "homestay-reviews");
    }

    const review = await Review.create({
      homestay: homestayId,
      user: userId,
      comment,
      ratings: { overall: Number(overall) },
      images,
      isApproved: false,
    });

    res.json({ success: true, review });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET REVIEWS */
exports.getHomestayReviews = async (req, res) => {
  try {
    const { homestayId } = req.params;

    const reviews = await Review.find({
      homestay: homestayId,
      isApproved: true,
      isVisible: true,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ reviews });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* MY REVIEW */
exports.getMyReview = async (req, res) => {
  const review = await Review.findOne({
    homestay: req.params.homestayId,
    user: req.user._id,
  });

  res.json({ review });
};

/* UPDATE */
exports.updateReview = async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    user: req.user._id,
  });

  if (!review) return res.status(404).json({ message: "Not found" });

  if (req.body.comment) review.comment = req.body.comment;
  if (req.body.overall) review.ratings.overall = Number(req.body.overall);

  await review.save();

  res.json({ success: true, review });
};

/* DELETE */
exports.deleteReview = async (req, res) => {
  await Review.findOneAndDelete({
    _id: req.params.reviewId,
    user: req.user._id,
  });

  res.json({ success: true });
};

/* HELPFUL */
exports.markHelpful = async (req, res) => {
  const userId = req.user._id;
  const review = await Review.findById(req.params.reviewId);

  const exists = review.helpfulBy.includes(userId);

  if (exists) {
    review.helpfulBy.pull(userId);
    review.helpfulVotes--;
  } else {
    review.helpfulBy.push(userId);
    review.helpfulVotes++;
  }

  await review.save();

  res.json({ helpfulVotes: review.helpfulVotes });
};

/* VENDOR REPLY */
exports.vendorReply = async (req, res) => {
  const review = await Review.findById(req.params.reviewId).populate("homestay");

  if (!review) return res.status(404).json({ message: "Not found" });

  if (!review.homestay.vendor.equals(req.vendor._id))
    return res.status(403).json({ message: "Not allowed" });

  review.vendorReply = {
    text: req.body.text,
    repliedAt: new Date(),
  };

  await review.save();

  res.json({ success: true });
};

/* VENDOR REVIEWS */
exports.getVendorReviews = async (req, res) => {
  const homestays = await Homestay.find({ vendor: req.vendor._id }).select("_id");

  const reviews = await Review.find({
    homestay: { $in: homestays },
  })
    .populate("user", "name")
    .populate("homestay", "propertyName");

  res.json({ reviews });
};

/* ADMIN */
exports.moderateReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  const { action } = req.body;

  if (action === "approve") review.isApproved = true;
  if (action === "reject") review.isVisible = false;
  if (action === "flag") review.flagged = true;

  await review.save();

  res.json({ success: true });
};

exports.adminGetReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("user")
    .populate("homestay");

  res.json({ reviews });
};