CREATE TABLE `genres` (
  `genreId` varchar(255) NOT NULL,
  `eventTypeId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`genreId`),
  KEY `eventTypeId` (`eventTypeId`),
  CONSTRAINT `genre_ibfk_1` FOREIGN KEY (`eventTypeId`) REFERENCES `eventtypes` (`eventTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
