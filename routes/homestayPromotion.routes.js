const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createPromotion,
  getPromotions,
  deletePromotion,
} = require("../controllers/homestayPromotion.controller");

router.use(protect);

router.post("/", createPromotion);
router.get("/", getPromotions);
router.delete("/:id", deletePromotion);

module.exports = router;