CREATE TABLE `eventsrepeats` (
  `eventId` int NOT NULL,
  `date` timestamp NOT NULL,
  PRIMARY KEY (`date`),
  CONSTRAINT `eventsrepeats_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`eventId`)
)
