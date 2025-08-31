const express = require("express");
const TopggController = require("./controllers/TopggController");

const router = express.Router();

router.post("/webhook", TopggController.voteWebhook);

module.exports = router;
