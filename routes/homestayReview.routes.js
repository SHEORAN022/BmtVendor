const router = require("express").Router();
const userAuth = require("../middleware/auth.middleware");
const vendorAuth = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const {
  addReview,
  getHomestayReviews,
  getMyReview,
  updateReview,
  deleteReview,
  markHelpful,
  vendorReply,
  getVendorReviews,
  moderateReview,
  adminGetReviews,
} = require("../controllers/homestayReview.controller");

/* PUBLIC */
router.get("/homestay/:homestayId", getHomestayReviews);

/* USER */
router.post("/", userAuth, upload.fields([{ name: "images", maxCount: 5 }]), addReview);
router.get("/my/:homestayId", userAuth, getMyReview);
router.put("/:reviewId", userAuth, upload.fields([{ name: "images", maxCount: 5 }]), updateReview);
router.delete("/:reviewId", userAuth, deleteReview);
router.post("/:reviewId/helpful", userAuth, markHelpful);

/* VENDOR */
router.get("/vendor", vendorAuth, getVendorReviews);
router.post("/:reviewId/reply", vendorAuth, vendorReply);

/* ADMIN */
router.get("/admin", adminGetReviews);
router.patch("/:reviewId/moderate", moderateReview);

module.exports = router;