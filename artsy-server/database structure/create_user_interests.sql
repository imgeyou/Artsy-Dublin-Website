-- This is just for local test

CREATE TABLE `userInterests` (
  `userId` int NOT NULL,
  `genreId` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`, `genreId`),
  CONSTRAINT `ui_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `ui_ibfk_2` FOREIGN KEY (`genreId`) REFERENCES `genres` (`genreId`)
);