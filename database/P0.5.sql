CREATE DATABASE artsy_dublin;
USE artsy_dublin;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `eventCategories` (
  `categoryId`   INT PRIMARY KEY AUTO_INCREMENT,
  `categoryName` VARCHAR(50) UNIQUE NOT NULL,
  `description`  TEXT
);

CREATE TABLE `eventTags` (
  `tagId`   INT PRIMARY KEY AUTO_INCREMENT,
  `tagName` VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE `events` (
  `eventId`     INT PRIMARY KEY AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT,
  `date`        VARCHAR(255),
  `venue`       VARCHAR(255),
  `eventUrl`    VARCHAR(255),
  `posterUrl`   VARCHAR(255),
  `categoryId`  INT,
  `source`      VARCHAR(100),
  `createdAt`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `event_tag_map` (
  `eventId` INT NOT NULL,
  `tagId`   INT NOT NULL,
  PRIMARY KEY (`eventId`, `tagId`)
);

CREATE TABLE `diary_entries` (
  `entryId`    INT PRIMARY KEY AUTO_INCREMENT,
  `eventId`    INT,
  `rating`     TINYINT CHECK (rating BETWEEN 1 AND 5),
  `reviewText` TEXT,
  `imageUrl`   VARCHAR(255),
  `createdAt`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `comments` (
  `commentId` INT PRIMARY KEY AUTO_INCREMENT,
  `entryId`   INT NOT NULL,
  `content`   VARCHAR(500) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `eventCategories` (`categoryName`, `description`) VALUES
  ('Music',      'Live music events'),
  ('Theatre',    'Stage performances'),
  ('Film',       'Cinema screenings'),
  ('Dance',      'Dance performances'),
  ('Exhibition', 'Art exhibitions');