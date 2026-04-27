const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const bnbValidationSchema = require("../validators/bnbvalidators");
const validate = require("../middleware/validate");
const bnbController = require("../controllers/bnbController");
const upload = require("../middleware/upload");

/* ================= ADD PROPERTY ================= */

router.post(
  "/add",
  upload.fields([
    { name: "propertyImages", maxCount: 10 },
    { name: "frontImages", maxCount: 5 },
    { name: "receptionImages", maxCount: 5 }
  ]),
  validate(bnbValidationSchema),
  bnbController.addBnb
);

router.get("/", bnbController.getAllBnb);
router.get("/:id", bnbController.getSingleBnb);

router.put(
  "/update/:id",
  upload.fields([
    { name: "propertyImages", maxCount: 10 },
    { name: "frontImages", maxCount: 5 },
    { name: "receptionImages", maxCount: 5 }
  ]),
  bnbController.updateBnb
);

router.delete("/delete/:id", bnbController.deleteBnb);

router.patch("/approve/:id", bnbController.approveProperty);
router.patch("/feature/:id", bnbController.featureProperty);

module.exports = router;