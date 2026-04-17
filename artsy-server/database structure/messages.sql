
CREATE TABLE `conversations` (
  `conversationId` int NOT NULL AUTO_INCREMENT,
  `userAId`  int NOT NULL,
  `userBId`  int NOT NULL,
  `lastMessageAt`  timestamp NULL DEFAULT NULL,
  `createdAt`  timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`conversationId`),
  UNIQUE KEY `unique_pair` (`userAId`, `userBId`),
  CONSTRAINT `conv_ibfk_1` FOREIGN KEY (`userAId`) REFERENCES `users` (`userId`),
  CONSTRAINT `conv_ibfk_2` FOREIGN KEY (`userBId`) REFERENCES `users` (`userId`)
);

-- Individual text messages belonging to a conversation
CREATE TABLE `messages` (
  `messageId`  int NOT NULL AUTO_INCREMENT,
  `conversationId` int NOT NULL,
  `senderId`  int NOT NULL,
  `content` text NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`messageId`),
  KEY `idx_conv` (`conversationId`),
  KEY `idx_sender` (`senderId`),
  CONSTRAINT `msg_ibfk_1` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`conversationId`),
  CONSTRAINT `msg_ibfk_2` FOREIGN KEY (`senderId`)  REFERENCES `users` (`userId`)
);