const express = require("express");
const router = express.Router();
const redemptionCodeController = require("../controllers/redemptionCodeController");
const authenticateToken = require("../middlewares/authenticateToken");

//Apenas vai mostrar códigos associados ao próprio utilizador
router.get('/', authenticateToken, redemptionCodeController.getRedemptionCodesController);
router.post('/', authenticateToken, redemptionCodeController.createRedemptionCodeController);
// Para Admin
router.get('/all', authenticateToken, redemptionCodeController.getAllRedemptionCodesAdminController);

module.exports = router;