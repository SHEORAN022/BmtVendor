const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createPromotion,
  getPromotions,
  getSinglePromotion,
  updatePromotion,
  deletePromotion,
  toggleStatus,
} = require("../controllers/promotion.controller");

/* ================= MIDDLEWARE ================= */
router.use(protect);

/* ================= ROUTES ================= */

/* CREATE */
router.post("/", createPromotion);

/* GET ALL */
router.get("/", getPromotions);

/* GET SINGLE */
router.get("/:id", getSinglePromotion);

/* UPDATE */
router.put("/:id", updatePromotion);

/* DELETE */
router.delete("/:id", deletePromotion);

/* TOGGLE ACTIVE / INACTIVE */
router.patch("/:id/status", toggleStatus);

module.exports = router;