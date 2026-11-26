const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authenticateToken = require("../middlewares/authenticateToken");

//admin para estabelecimentos
router.delete("/:addressId", authenticateToken, addressController.deleteAddressController);
router.patch("/:addressId", authenticateToken, addressController.updateAddressController); 
router.get('/', authenticateToken,addressController.getAllAddressesController); 

//Vizinho
router.post("/", addressController.createAddressController);

module.exports = router;
