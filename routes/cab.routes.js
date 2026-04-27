
const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const {
  addCab,
  getVendorCabs,
  updateCab,
  deleteCab,
} = require("../controllers/cab.controller");

// image = main image
// gallery = multiple images (max 10)
const cabUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

router.use(protect);

router.post("/", cabUpload, addCab);
router.get("/", getVendorCabs);
router.put("/:id", cabUpload, updateCab);
router.delete("/:id", deleteCab);

module.exports = router;
