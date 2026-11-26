const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get('/', authenticateToken, notificationController.getNotificationController);
router.get('/:notificationId', authenticateToken, notificationController.getNotificationbyIdController);
router.post('/', authenticateToken, notificationController.createNotificationController);

module.exports = router;