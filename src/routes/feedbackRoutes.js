const express = require("express");
const router = express.Router();
const feedbackControler= require("../controllers/feedbackController");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", authenticateToken, feedbackControler.getfeedbackAvaliacaoController);
router.post("/", authenticateToken, feedbackControler.createfeedbackAvaliacaoController);

module.exports = router;