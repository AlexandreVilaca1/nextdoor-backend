const express = require("express");
const router = express.Router();
const businessProcessController = require("../controllers/businessProcessController");
const authenticateToken = require("../middlewares/authenticateToken");

router.patch('/validateTask', authenticateToken, businessProcessController.aceptValidationTaskLogicController);
router.patch('/rejectTask', authenticateToken, businessProcessController.rejectValidationTaskLogicController);
router.patch('/collectPointsAbandonedTask', authenticateToken, businessProcessController.collectPointsAfterAbandonTaskController);
router.patch('/markTaskAsCompleted', authenticateToken, businessProcessController.markTaskAsCompletedController);
router.patch('/abandonedTask', authenticateToken, businessProcessController.abandonedTaskController);

module.exports = router;