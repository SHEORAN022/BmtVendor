const router = require("express").Router();
const protect = require("../middleware/auth.middleware");

const {
  createBusType,
  getBusTypes,
  getBusTypeById,
  updateBusType,
  deleteBusType,
} = require("../controllers/busType.controller");


router.use(protect);

router.route("/")
  .post(createBusType)  
  .get(getBusTypes);    

router.route("/:id")
  .get(getBusTypeById)   
  .put(updateBusType)    
  .delete(deleteBusType); 

module.exports = router;