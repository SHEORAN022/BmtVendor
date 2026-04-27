const express = require("express");
const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");
const {
  createApartment,
  getMyApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
  toggleActiveStatus,
} = require("../controllers/Apartment.controller");

const router = express.Router();

router.use(protect);

router.post("/", upload.array("images", 10), createApartment);
router.get("/", getMyApartments);
router.get("/:id", getApartmentById);
router.put("/:id", upload.array("images", 10), updateApartment);
router.delete("/:id", deleteApartment);
router.patch("/:id/toggle", toggleActiveStatus);

module.exports = router;