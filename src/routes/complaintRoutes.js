const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get('/', authenticateToken, complaintController.getAllComplaintsController);
router.get('/:complaintId', authenticateToken, complaintController.getComplaintByIdController);
router.post('/', authenticateToken, complaintController.createComplaintController);

module.exports = router;