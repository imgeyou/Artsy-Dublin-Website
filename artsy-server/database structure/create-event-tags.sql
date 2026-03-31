CREATE TABLE `eventtags` (
  `eventTagsId` varchar(255) NOT NULL,
  -- will be combo of event-genre st repeat of the same event-genre combo isnt stored but only new genres attributed to the same event get added per call.
  `eventId` INT NOT NULL,
  `genreId` varchar(255) NOT NULL,
  PRIMARY KEY (`eventTagsId`),
  KEY `eventId` (`eventId`),
  KEY `genreId` (`genreId`),
  CONSTRAINT `eventtags_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`),
  CONSTRAINT `eventtags_ibfk_2` FOREIGN KEY (`genreId`) REFERENCES `genres` (`genreId`)
) 