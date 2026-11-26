const express = require("express");
const router = express.Router();
const businessProcessController = require("../controllers/businessProcessController");
const sqlInjectionGuard = require("../middlewares/sqlInjectionGuard");
const authenticateToken = require("../middlewares/authenticateToken");

router.patch('/validateTask', sqlInjectionGuard, authenticateToken, businessProcessController.aceptValidationTaskLogicController);
router.patch('/rejectTask', sqlInjectionGuard, authenticateToken, businessProcessController.rejectValidationTaskLogicController);
router.patch('/collectPointsAbandonedTask', sqlInjectionGuard, authenticateToken, businessProcessController.collectPointsAfterAbandonTaskController);
router.patch('/markTaskAsCompleted', sqlInjectionGuard, authenticateToken, businessProcessController.markTaskAsCompletedController);
router.patch('/abandonedTask', sqlInjectionGuard, authenticateToken, businessProcessController.abandonedTaskController);

module.exports = router;