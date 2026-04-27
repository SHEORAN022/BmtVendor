
const express = require("express");
const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");
const {
  createHomestay,
  getMyHomestays,
  getHomestayById,
  updateHomestay,
  deleteHomestay,
  toggleActiveStatus,
} = require("../controllers/homestay.controller");

const router = express.Router();

router.use(protect);

router.post("/", upload.array("images", 10), createHomestay);
router.get("/", getMyHomestays);
router.get("/:id", getHomestayById);
router.put("/:id", upload.array("images", 10), updateHomestay);
router.delete("/:id", deleteHomestay);
router.patch("/:id/toggle", toggleActiveStatus);

module.exports = router;