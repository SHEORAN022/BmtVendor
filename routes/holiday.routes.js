const express = require("express");
const protect = require("../middleware/auth.middleware");
const upload = require("../utils/upload");
const {
  createHoliday,
  getVendorHolidays,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidayPackage.controller");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createHoliday
);

router.get("/", getVendorHolidays);

router.put(
  "/:id",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateHoliday
);

router.delete("/:id", deleteHoliday);

module.exports = router;
