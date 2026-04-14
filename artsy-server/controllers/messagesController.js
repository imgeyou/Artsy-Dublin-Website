
// 1.startConversation -POST /messages/conversations
// 2.getInbox- GET  /messages/conversations
// 3.getConversation-GET  /messages/conversations/:conversationId
// 4.deleteConversation - DELETE /messages/conversations/:conversationId

const messagesModel = require("../models/messages");
const MAX_MESSAGE_LENGTH = 2000;

// 1. Start or reopen conversation with another user
async function startConversation(req, res) {
  try {
   const currentUser = await resolveDbUser(req, res);
   if (!currentUser) return ;

   const targetUserId =  parseInt(req.body.targetUserId, 10);

   if (!targetUserId || isNaN(targetUserId)) {
     return res.status(400).json({ error: "targetUserId is required" });
   }

   if (targetUserId ===  currentUser.userId) {
     return res.status(400).json({  error: "You cannot message yourself..." }) ;
   }

   const conversationId =  await messagesModel.findOrCreateConversation(
     currentUser.userId,
     targetUserId,
   );

   res.json({ conversationId }) ;
  } catch  (err) {
   console.error("startConversation Error:", err);
   res.status(500).json({ error: "Internal server error" });
  }

}

// 2.Inbox -all conversations for the logged in user, newest go first
async function getInbox(req, res) {
 try {
   const currentUser = await resolveDbUser(req, res);
   if (!currentUser)  return;

   const conversations =  await messagesModel.getConversationsForUser(currentUser.userId);
   res.json(conversations);
  } catch (err)  {
   console.error ("getInbox Error:", err);
   res.status(500).json({ error: "Internal server error" });
  }

}

// 3.Open a conversation- returns all messages and marks them read
async function  getConversation(req, res) {
 try {
   const currentUser = await resolveDbUser(req, res) ;
   if (!currentUser) return;

   const conversationId =  parseInt(req.params.conversationId, 10);
   if (isNaN(conversationId)) {
     return res.status(400).json({ error: "Invalid conversationId" });
   }

   const messages  = await messagesModel.getMessagesByConversation(
     conversationId,
     currentUser.userId,
   );
   if (messages  === null) {
     return res.status(403).json({ error: "Not a participant in this conversation" });
   }

   await messagesModel.markConversationRead(conversationId, currentUser.userId);

   res.json(messages);
  } catch (err) {
   console.error("getConversation Error:", err) ;
   res.status(500).json({ error: "Internal server error" });
  }

}

// 4. Delete a conversation and all its messages (participant only, confirmation if u indeed want to delete appears)
async function deleteConversation(req, res) {
 try {
   const currentUser = await resolveDbUser(req, res);
   if (!currentUser) return;

   const conversationId = parseInt(req.params.conversationId, 10);
   if (isNaN(conversationId)) {
     return res.status(400).json({ error: "Invalid conversationId" });
   }

   const deleted = await messagesModel.deleteConversation(conversationId, currentUser.userId);
   if (!deleted) {
     return res.status(403).json({ error: "Not a participant in this conversation" });
   }

   res.json({ message: "Conversation deleted" });
  } catch (err) {
   console.error("deleteConversation Error:", err);
   res.status(500).json({ error: "Internal server error" });
  }

}

// Helper- look up mysql user row from the Firebase uid on req.user
// Sends a 404 and returns null if the user is not found
async function resolveDbUser(req, res) {
  const usersModelInstance = require("../models/users");
  const dbUser = await usersModelInstance.getUserByFirebaseUid(req.user.uid);
  if (!dbUser) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  return dbUser;
}




module.exports = { startConversation, getInbox, getConversation, deleteConversation } ;
