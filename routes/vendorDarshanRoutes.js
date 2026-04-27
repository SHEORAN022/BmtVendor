const express = require("express");
const router = express.Router();

const controller = require("../controllers/vendorDarshanController");
const upload = require("../utils/upload");
const protect = require("../middleware/auth.middleware");
router.post(
  "/",
  protect,
  upload.array("images", 10), // max 10 images
  controller.createDarshan
);

router.get(
  "/",
  protect,
  controller.getMyDarshans
);

router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  controller.updateDarshan
);

router.delete(
  "/:id",
  protect,
  controller.deleteDarshan
);

module.exports = router;
