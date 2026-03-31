CREATE TABLE `events` (
  `eventId` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `startDateTime` timestamp NULL DEFAULT NULL,
  `posterUrl` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT (now()),
  `updatedAt` timestamp NULL DEFAULT NULL,
  `attendCount` int DEFAULT '0',
  `reviewCount` int DEFAULT '0',
  `saveCount` int DEFAULT '0',
  `eventTypeId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`eventId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
