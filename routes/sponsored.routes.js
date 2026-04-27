const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createCampaign,
  getCampaigns
} = require("../controllers/sponsored.controller");

router.use(protect);

router.post("/", createCampaign);
router.get("/", getCampaigns);

module.exports = router;