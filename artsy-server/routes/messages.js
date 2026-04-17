//  all routes require an authenticated session

const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  startConversation,
  getInbox,
  getConversation,
  deleteConversation,
}= require("../controllers/messagesController");

router.use(authenticate);

router.post("/conversations", startConversation);
router.get("/conversations", getInbox);
router.get("/conversations/:conversationId", getConversation);
router.delete("/conversations/:conversationId", deleteConversation);

module.exports = router;