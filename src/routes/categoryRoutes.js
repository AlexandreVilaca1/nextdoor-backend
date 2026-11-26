const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get('/', authenticateToken, categoryController.getCategoryController);
router.get('/:categoryId', authenticateToken, categoryController.getCategoryByIdController);

module.exports = router;