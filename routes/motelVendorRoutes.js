const router = require("express").Router();
const upload = require("../middleware/upload");

const controller = require("../controllers/motelVendorController");

/* ADD */
router.post(
  "/add",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "gstImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 }
  ]),
  controller.addMotelVendor
);

/* GET ALL */
router.get("/", controller.getAllMotelVendors);

/* GET BY ID */
router.get("/:id", controller.getMotelVendorById);

/* UPDATE */
router.put(
  "/update/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "gstImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "aadhaarImage", maxCount: 1 }
  ]),
  controller.updateMotelVendor
);

/* DELETE */
router.delete("/delete/:id", controller.deleteMotelVendor);

module.exports = router;