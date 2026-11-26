const express = require("express");
const router = express.Router();
const establishmentController = require("../controllers/establishmentController");
const authenticateToken = require("../middlewares/authenticateToken");

//Admin
router.get("/neighborhood/:neighborhoodId", authenticateToken, establishmentController.getEstablishmentsByNeighborhoodController); //Um admin poderá ver os establecimentos por vizinhança
router.post("/", authenticateToken, establishmentController.createEstablishmentController);
router.patch("/:establishmentId", authenticateToken, establishmentController.updateEstablishmentController);
router.delete("/:establishmentId", authenticateToken, establishmentController.deleteEstablishmentController);
router.get('/all', authenticateToken, establishmentController.getAllEstablishmentsAdminController);

//Neighboors
router.get("/", authenticateToken, establishmentController.getEstablishmentsController); //Um vizinho poderá ver os establecimentos associados á sua viziznhança
router.get("/:establishmentId", authenticateToken, establishmentController.getEstablishmentByIdController);

module.exports = router;
