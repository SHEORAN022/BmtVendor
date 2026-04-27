const express = require("express");
const router = express.Router();

const vacationHouseController = require("../controllers/vacationHouseController");
const upload = require("../middleware/upload");
const protectVendor = require("../middleware/auth.middleware");

/* ================= ADD VACATION HOUSE ================= */
router.post(
  "/add",
  protectVendor,
  upload.any(),
  vacationHouseController.addVacationHouse
);

/* ================= GET ALL VENDOR HOUSES ================= */
router.get(
  "/my-houses",
  protectVendor,
  vacationHouseController.getVendorVacationHouses
);

/* ================= GET SINGLE HOUSE ================= */
router.get(
  "/:id",
  protectVendor,
  vacationHouseController.getSingleVacationHouse
);

/* ================= UPDATE HOUSE ================= */
router.put(
  "/update/:id",
  protectVendor,
  upload.any(),
  vacationHouseController.updateVacationHouse
);

/* ================= DELETE HOUSE ================= */
router.delete(
  "/delete/:id",
  protectVendor,
  vacationHouseController.deleteVacationHouse
);

module.exports = router;