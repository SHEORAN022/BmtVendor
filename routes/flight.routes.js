
const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const {
  addFlight,
  getVendorFlights,
  updateFlight,
  deleteFlight,
  searchFlights,
} = require("../controllers/flight.controller");

/* ================= VENDOR ================= */
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },      // main image
    { name: "gallery", maxCount: 10 },   // gallery images
  ]),
  addFlight
);

router.get("/vendor", protect, getVendorFlights);

router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateFlight
);

router.delete("/:id", protect, deleteFlight);

/* ================= USER ================= */
router.get("/search", searchFlights);

module.exports = router;
