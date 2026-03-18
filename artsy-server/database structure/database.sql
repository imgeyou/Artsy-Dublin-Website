
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

-- CREATE TABLE `users` (
--   `userId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userName` varchar(255) UNIQUE NOT NULL DEFAULT (userId),
--   `email` varchar(255) UNIQUE NOT NULL,
--   `avatarUrl` varchar(255),
--   `passwordHash` varchar(255) NOT NULL,
--   `birthday` date,
--   `location` integer,
--   `bio` varchar(255),
--   `gender` integer,
--   `createdAt` timestamp DEFAULT (now()),
--   `updatedAt` timestamp
-- );

-- CREATE TABLE `events` (
--   `eventId` integer PRIMARY KEY AUTO_INCREMENT,
--   `creatorId` integer,
--   `title` varchar(255) NOT NULL,
--   `description` varchar(255),
--   `posterUrl` varchar(255),
--   `startDateTime` timestamp NOT NULL,
--   `endDateTime` timestamp,
--   `venue` integer,
--   `location` integer,
--   `minprice` decimal(10,2) DEFAULT 0,
--   `maxprice` decimal(10,2) DEFAULT 0,
--   `currency` integer,
--   `ticketlink` varchar(255),
--   `viewCount` integer DEFAULT 0,
--   `sourcePlatform` integer,
--   `createdAt` timestamp DEFAULT (now()),
--   `updatedAt` timestamp
-- );

-- CREATE TABLE `eventExternalSources` (
--   `eventId` integer PRIMARY KEY,
--   `externalApiId` varchar(255),
--   `externalApiSource` integer,
--   `externalUrl` varchar(255),
--   `lastSyncedAt` timestamp
-- );

-- CREATE TABLE `sourcePlatform` (
--   `sourceId` integer PRIMARY KEY,
--   `sourceName` varchar(255),
--   `sourceIconUrl` varchar(255)
-- );

-- CREATE TABLE `eventSaves` (
--   `eventSaveId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userId` integer,
--   `eventId` integer,
--   `wantBuddy` boolean DEFAULT false,
--   `eventSavedAt` timestamp DEFAULT (now())
-- );

-- CREATE TABLE `eventAttended` (
--   `eventAttendId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userId` integer,
--   `eventId` integer,
--   `attendedAt` timestamp,
--   `createdAt` timestamp DEFAULT (now()),
--   `rating` integer,
--   `postId` integer
-- );

-- CREATE TABLE `posts` (
--   `postId` integer PRIMARY KEY AUTO_INCREMENT,
--   `postType` integer NOT NULL,
--   `userId` integer NOT NULL,
--   `eventId` integer,
--   `postParentId` integer,
--   `content` text NOT NULL,
--   `isDeleted` boolean DEFAULT false,
--   `deletedAt` timestamp,
--   `createdAt` timestamp DEFAULT (now()),
--   `updatedAt` timestamp
-- );

-- CREATE TABLE `postImages` (
--   `postImageId` integer PRIMARY KEY AUTO_INCREMENT,
--   `imageUrl` varchar(255),
--   `postId` integer
-- );

-- CREATE TABLE `postLikes` (
--   `likeId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userId` integer,
--   `postId` integer,
--   `postLikedAt` timestamp DEFAULT (now())
-- );

-- CREATE TABLE `eventCategories` (
--   `categoryId` integer PRIMARY KEY AUTO_INCREMENT,
--   `categoryName` varchar(50) UNIQUE NOT NULL,
--   `description` text
-- );

-- CREATE TABLE `eventTags` (
--   `tagId` integer PRIMARY KEY AUTO_INCREMENT,
--   `tagName` varchar(50) UNIQUE NOT NULL
-- );

-- CREATE TABLE `user_category_map` (
--   `userCategoryId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userId` integer,
--   `categoryId` integer
-- );

-- CREATE TABLE `user_tag_map` (
--   `userTagId` integer PRIMARY KEY AUTO_INCREMENT,
--   `userId` integer,
--   `tagId` integer
-- );

-- CREATE TABLE `event_category_map` (
--   `eventCategoryId` integer PRIMARY KEY AUTO_INCREMENT,
--   `eventId` integer,
--   `categoryId` integer
-- );

-- CREATE TABLE `event_tag_map` (
--   `eventTagId` integer PRIMARY KEY AUTO_INCREMENT,
--   `eventId` integer,
--   `tagId` integer
-- );

-- CREATE TABLE `userGender` (
--   `genderId` integer PRIMARY KEY,
--   `genderName` varchar(255)
-- );

-- CREATE TABLE `userLocation` (
--   `locationId` integer PRIMARY KEY,
--   `locationName` varchar(255)
-- );

-- CREATE TABLE `venues` (
--   `venueId` integer PRIMARY KEY AUTO_INCREMENT,
--   `venueName` varchar(255) NOT NULL,
--   `address` varchar(255),
--   `latitude` decimal(10,8) NOT NULL,
--   `longitude` decimal(11,8) NOT NULL,
--   `website` varchar(255),
--   `createdAt` timestamp
-- );

-- CREATE TABLE `eventLocation` (
--   `locationId` integer PRIMARY KEY AUTO_INCREMENT,
--   `latitude` decimal(10,8) NOT NULL,
--   `longitude` decimal(11,8) NOT NULL,
--   `createdAt` timestamp
-- );

-- CREATE TABLE `currency` (
--   `currencyId` integer PRIMARY KEY,
--   `currencyName` varchar(3) DEFAULT 'EUR'
-- );

-- CREATE TABLE `postType` (
--   `typeId` integer PRIMARY KEY,
--   `typeName` varchar(255)
-- );

-- ALTER TABLE `users` ADD FOREIGN KEY (`location`) REFERENCES `userLocation` (`locationId`);

-- ALTER TABLE `users` ADD FOREIGN KEY (`gender`) REFERENCES `userGender` (`genderId`);

-- ALTER TABLE `events` ADD FOREIGN KEY (`creatorId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `events` ADD FOREIGN KEY (`venue`) REFERENCES `venues` (`venueId`);

-- ALTER TABLE `events` ADD FOREIGN KEY (`location`) REFERENCES `eventLocation` (`locationId`);

-- ALTER TABLE `events` ADD FOREIGN KEY (`currency`) REFERENCES `currency` (`currencyId`);

-- ALTER TABLE `events` ADD FOREIGN KEY (`sourcePlatform`) REFERENCES `sourcePlatform` (`sourceId`);

-- ALTER TABLE `eventExternalSources` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `eventExternalSources` ADD FOREIGN KEY (`externalApiSource`) REFERENCES `sourcePlatform` (`sourceId`);

-- ALTER TABLE `eventSaves` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `eventSaves` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `eventAttended` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `eventAttended` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `eventAttended` ADD FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`);

-- ALTER TABLE `posts` ADD FOREIGN KEY (`postType`) REFERENCES `postType` (`typeId`);

-- ALTER TABLE `posts` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `posts` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `posts` ADD FOREIGN KEY (`postParentId`) REFERENCES `posts` (`postId`);

-- ALTER TABLE `postImages` ADD FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`);

-- ALTER TABLE `postLikes` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `postLikes` ADD FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`);

-- ALTER TABLE `user_category_map` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `user_category_map` ADD FOREIGN KEY (`categoryId`) REFERENCES `eventCategories` (`categoryId`);

-- ALTER TABLE `user_tag_map` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

-- ALTER TABLE `user_tag_map` ADD FOREIGN KEY (`tagId`) REFERENCES `eventTags` (`tagId`);

-- ALTER TABLE `event_category_map` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `event_category_map` ADD FOREIGN KEY (`categoryId`) REFERENCES `eventCategories` (`categoryId`);

-- ALTER TABLE `event_tag_map` ADD FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`);

-- ALTER TABLE `event_tag_map` ADD FOREIGN KEY (`tagId`) REFERENCES `eventTags` (`tagId`);



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
