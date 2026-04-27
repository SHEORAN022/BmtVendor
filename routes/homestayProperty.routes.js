const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createHomestayProperty,
  getVendorHomestayProperties,
  getSingleHomestayProperty,
  updateHomestayProperty,
  updateHomestayLocation,
} = require("../controllers/homestayProperty.controller");

router.use(protect);

/* CREATE */
router.post("/", createHomestayProperty);

/* GET ALL */
router.get("/", getVendorHomestayProperties);

/* GET SINGLE */
router.get("/:id", getSingleHomestayProperty);

/* UPDATE */
router.put("/:id", updateHomestayProperty);

/* UPDATE LOCATION */
router.put("/:id/location", updateHomestayLocation);

module.exports = router;