const express = require("express");
const router = express.Router();
const neighborhoodController= require("../controllers/neighborhoodController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", neighborhoodController.getNeighborhoodController);
router.post("/", authenticateToken, neighborhoodController.createNeighborhoodController);
router.delete("/:neighborhoodId", authenticateToken, neighborhoodController.deleteNeighborhoodController);
router.get("/byName/:nomeFreguesia", authenticateToken, neighborhoodController.getNeighborhoodByNameController);

module.exports = router;
