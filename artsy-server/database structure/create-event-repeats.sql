CREATE TABLE `eventsrepeats` (
  `repeatsId` int NOT NULL AUTO_INCREMENT,
  `eventId` int NOT NULL,
  `date` timestamp NOT NULL,
  PRIMARY KEY (`repeatsId`),
  CONSTRAINT `eventsrepeats_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`)
)
