const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  getInventory,
  updateInventory,
  updateSingleDate,
  initInventory,
} = require("../controllers/vacationHouseInventory.controller");

router.use(protect);

router.get("/", getInventory);
router.post("/bulk", updateInventory);
router.post("/single", updateSingleDate);
router.post("/init", initInventory);

module.exports = router;