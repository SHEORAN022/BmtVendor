const express = require("express");
const router = express.Router();

const palaceController = require("../controllers/palaceController");
const upload = require("../middleware/upload");

/* ADD PALACE */
router.post("/add", upload.any(), palaceController.addPalace);

/* GET ALL */
router.get("/all", palaceController.getAllPalaces);

/* GET SINGLE */
router.get("/:id", palaceController.getPalaceById);

/* UPDATE */
router.put("/update/:id", upload.any(), palaceController.updatePalace);

/* DELETE */
router.delete("/delete/:id", palaceController.deletePalace);

module.exports = router;