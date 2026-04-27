const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const controller = require("../controllers/property.controller");

router.use(protect);

router.post("/", controller.createProperty);
router.get("/", controller.getVendorHotels);
router.get("/:id", controller.getSingleHotel);
router.put("/:id", controller.updateProperty);
router.put("/:id/location", controller.updateLocation);

module.exports = router;