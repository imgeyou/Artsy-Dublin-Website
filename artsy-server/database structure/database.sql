
------USERS---------------------------------------------------------------
CREATE TABLE `userlocation` (
  `locationId` int NOT NULL,
  `locationName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`locationId`)
);

CREATE TABLE `usergender` (
  `genderId` int NOT NULL,
  `genderName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`genderId`)
);

CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `location` int DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `gender` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userName` (`userName`),
  UNIQUE KEY `email` (`email`),
  KEY `location` (`location`),
  KEY `gender` (`gender`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`location`) REFERENCES `userlocation` (`locationId`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`gender`) REFERENCES `usergender` (`genderId`)
);



-----------EVENTS------------------------------------------------------------------------------------------
CREATE TABLE `apievents` (
  `name` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`name`)
);
CREATE TABLE `events` (
  `eventId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `posterUrl` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT NULL,
  `attendCount` INT DEFAULT 0,
  `reviewCount` INT DEFAULT 0,
  `saveCount` INT DEFAULT 0,
  PRIMARY KEY (`eventId`)
);

--------POSTS (seen in diary): all the tables storing data regarding post/comment, log-event, like, star-rate, etc-------------
CREATE TABLE `posttype` (
  `typeId` int NOT NULL,
  `typeName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`typeId`)
);

CREATE TABLE `eventattended` (
  `eventAttendId` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `eventId` int DEFAULT NULL,
  `attendedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `rating` int DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`eventAttendId`),
  KEY `userId` (`userId`),
  KEY `eventId` (`eventId`),
  CONSTRAINT `eventattended_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `eventattended_ibfk_2` FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`)
);

CREATE TABLE `posts` (
  `postId` int NOT NULL AUTO_INCREMENT,
  `type` int NOT NULL,
  `userId` int NOT NULL,
  `eventId` int DEFAULT NULL,
  `postParentId` int DEFAULT NULL,
  `content` text NOT NULL,
  `likeCount` int DEFAULT '0',
  `commentCount` int DEFAULT '0',
  `isDeleted` tinyint(1) DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT NULL,
  `eventAttendId` int DEFAULT NULL,
  PRIMARY KEY (`postId`),
  KEY `type` (`type`),
  KEY `userId` (`userId`),
  KEY `eventId` (`eventId`),
  KEY `postParentId` (`postParentId`),
  KEY `eventAttendId` (`eventAttendId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`type`) REFERENCES `posttype` (`typeId`),
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `posts_ibfk_4` FOREIGN KEY (`postParentId`) REFERENCES `posts` (`postId`),
  CONSTRAINT `posts_ibfk_5` FOREIGN KEY (`eventAttendId`) REFERENCES `eventattended` (`eventAttendId`)
);

CREATE TABLE `postimages` (
  `postImageId` int NOT NULL AUTO_INCREMENT,
  `imageUrl` varchar(255) DEFAULT NULL,
  `postId` int DEFAULT NULL,
  PRIMARY KEY (`postImageId`),
  KEY `postId` (`postId`),
  CONSTRAINT `postimages_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`)
);

CREATE TABLE `postlikes` (
  `likeId` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `postId` int DEFAULT NULL,
  `postLikedAt` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`likeId`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  CONSTRAINT `postlikes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `postlikes_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`)
);
-- user firebase id to replace password hash
ALTER TABLE users 
  ADD COLUMN `firebaseUid` varchar(255) DEFAULT NULL,
  DROP COLUMN `passwordHash`;


