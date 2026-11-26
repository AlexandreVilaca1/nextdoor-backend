const express = require("express");
const router = express.Router();
const neighborhoodController= require("../controllers/neighborhoodController");
const sqlInjectionGuard = require("../middlewares/sqlInjectionGuard");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", sqlInjectionGuard, neighborhoodController.getNeighborhoodController);
router.post("/", sqlInjectionGuard, authenticateToken, neighborhoodController.createNeighborhoodController);
router.delete("/:neighborhoodId", sqlInjectionGuard, authenticateToken, neighborhoodController.deleteNeighborhoodController);
router.get("/byName/:nomeFreguesia", sqlInjectionGuard, authenticateToken, neighborhoodController.getNeighborhoodByNameController);

module.exports = router;
