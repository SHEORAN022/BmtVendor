const router      = require("express").Router();
const userAuth    = require("../middleware/auth.middleware");       // user JWT
const vendorAuth  = require("../middleware/auth.middleware"); // vendor JWT
// const adminAuth   = require("../middleware/adminAuth.middleware");  // admin JWT
const upload      = require("../utils/upload");

const {
  addReview,
  getHotelReviews,
  getMyReview,
  updateReview,
  deleteReview,
  markHelpful,
  vendorReply,
  getVendorReviews,
  moderateReview,
  adminGetReviews,
} = require("../controllers/Review.controller");

/* ─── Public ─── */
router.get("/hotel/:hotelId", getHotelReviews);

/* ─── User (logged in) ─── */
router.post(
  "/",
  userAuth,
  upload.fields([{ name: "images", maxCount: 5 }]),
  addReview
);
router.get("/my/:hotelId",          userAuth, getMyReview);
router.put(
  "/:reviewId",
  userAuth,
  upload.fields([{ name: "images", maxCount: 5 }]),
  updateReview
);
router.delete("/:reviewId",         userAuth, deleteReview);
router.post("/:reviewId/helpful",   userAuth, markHelpful);

/* ─── Vendor ─── */
router.get("/vendor",               vendorAuth, getVendorReviews);
router.post("/:reviewId/reply",     vendorAuth, vendorReply);

/* ─── Admin ─── */
router.get("/admin",                adminGetReviews);
router.patch("/:reviewId/moderate",  moderateReview);

module.exports = router;
