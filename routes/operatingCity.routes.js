// const router = require("express").Router();
// const protect = require("../middleware/auth.middleware");

// const {
//   createCity,
//   getCities,
//   getCityById,
//   updateCity,
//   deleteCity,
//   toggleCityStatus,
//   getAllActiveCities,
// } = require("../controllers/operatingCity.controller");

// /* ================= VENDOR ================= */
// router.post("/", protect, createCity);
// router.get("/", protect, getCities);
// router.get("/:id", protect, getCityById);
// router.put("/:id", protect, updateCity);
// router.delete("/:id", protect, deleteCity);
// router.patch("/:id/toggle", protect, toggleCityStatus);

// /* ================= PUBLIC ================= */
// router.get("/public/all", getAllActiveCities);

// module.exports = router;

const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  // city
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  toggleCityStatus,
  getAllActiveCities,
  // pickup
  addPickupPoint,
  updatePickupPoint,
  deletePickupPoint,
  togglePickupPoint,
  // drop
  addDropPoint,
  updateDropPoint,
  deleteDropPoint,
  toggleDropPoint,
} = require("../controllers/operatingCity.controller");

/* ──────────────────────────────────────────────
   PUBLIC  (no auth needed)
────────────────────────────────────────────── */
router.get("/public/all", getAllActiveCities);

/* ──────────────────────────────────────────────
   VENDOR — CITY CRUD
────────────────────────────────────────────── */
router.post("/", protect, createCity);
router.get("/", protect, getCities);
router.get("/:id", protect, getCityById);
router.put("/:id", protect, updateCity);
router.delete("/:id", protect, deleteCity);
router.patch("/:id/toggle", protect, toggleCityStatus);

/* ──────────────────────────────────────────────
   VENDOR — PICKUP POINTS
────────────────────────────────────────────── */
router.post("/:id/pickup", protect, addPickupPoint);
router.put("/:id/pickup/:pointId", protect, updatePickupPoint);
router.delete("/:id/pickup/:pointId", protect, deletePickupPoint);
router.patch("/:id/pickup/:pointId/toggle", protect, togglePickupPoint);

/* ──────────────────────────────────────────────
   VENDOR — DROP POINTS
────────────────────────────────────────────── */
router.post("/:id/drop", protect, addDropPoint);
router.put("/:id/drop/:pointId", protect, updateDropPoint);
router.delete("/:id/drop/:pointId", protect, deleteDropPoint);
router.patch("/:id/drop/:pointId/toggle", protect, toggleDropPoint);

module.exports = router;