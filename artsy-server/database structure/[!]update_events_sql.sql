-- PHASE 1: MAKE THE EVENT TITLE THE PRIMARY KEY INSTEAD OF AN INT
-- bc ticketmaster is annoying.
-- 1. Drop the foreign key constraint and old eventId column in eventattended
ALTER TABLE `eventattended`
  DROP FOREIGN KEY `eventattended_ibfk_2`,
  DROP KEY `eventId`,
  DROP COLUMN `eventId`;

-- 2. Add the new title column to eventattended
ALTER TABLE `eventattended`
  ADD COLUMN `eventTitle` varchar(255) DEFAULT NULL,
  ADD KEY `eventTitle` (`eventTitle`);

-- 3. Now migrate events table
ALTER TABLE `events`
  DROP PRIMARY KEY,
  DROP COLUMN `eventId`,
  MODIFY COLUMN `title` varchar(255) NOT NULL,
  ADD PRIMARY KEY (`title`);

-- 4. Add the foreign key on the new column
ALTER TABLE `eventattended`
  ADD CONSTRAINT `eventattended_ibfk_2` FOREIGN KEY (`eventTitle`) REFERENCES `events` (`title`);

-- PHASE 2: ADDING EVENT TYPES, GENRES AND JUNCTION TABLE FOR CONNECTING EVENT TYPES AND GENRES
-- an event can only be of 1 type: arts & theatre, OR concert, OR film OR smth else.
CREATE TABLE `eventTypes` (
  `eventTypeId` varchar(255) NOT NULL, -- this isn't autoincrement bc i want to use the ticketmaster id
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`eventTypeId`)
);

-- but an event can have many genres under the eventType, e.g. film can be horror AND comedy
CREATE TABLE `genres` (
  `genreId` varchar(255) NOT NULL, -- this isn't autoincrement bc i want to use the ticketmaster id
  `name` varchar(255) NOT NULL,
  `eventTypeId` varchar(255) NOT NULL, -- this is the same one from eventTypes
  PRIMARY KEY (`genreId`),
  KEY `eventTypeId` (`eventTypeId`),
  CONSTRAINT `genre_ibfk_1` FOREIGN KEY (`eventTypeId`) REFERENCES `eventTypes` (`eventTypeId`)
);

-- creating junction table for connecting an event to: 1 type and many genres
-- this table will/could have the same event occuring many times (if it has multiple genres)
CREATE TABLE `eventTags` (
  `eventTagsId` int NOT NULL AUTO_INCREMENT, -- pk for this table
  `eventTitle` varchar(255) NOT NULL,
  `genreId` varchar(255) NOT NULL, -- can find event type thru this genreId connection
  `createdAt` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`eventTagsId`),
  KEY `eventTitle` (`eventTitle`),
  KEY `genreId` (`genreId`),
  CONSTRAINT `eventtags_ibfk_1` FOREIGN KEY (`eventTitle`) REFERENCES `events` (`title`),
  CONSTRAINT `eventtags_ibfk_2` FOREIGN KEY (`genreId`) REFERENCES `genres` (`genreId`)
);

-- add eventTypeId to events table
ALTER TABLE `events`
  ADD COLUMN `eventTypeId` varchar(255) DEFAULT NULL,
  ADD KEY `eventTypeId` (`eventTypeId`),
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`eventTypeId`) REFERENCES `eventTypes` (`eventTypeId`);

-- PHASE 3: ADD MORE COLUMNS TO EVENTS TABLE
ALTER TABLE events 
  ADD COLUMN startDateTime timestamp;
ALTER TABLE events 
  ADD COLUMN venue varchar(255);

-- this should be all the changed needed but if u run into any issues lmk!
-- if it doesn't work, try applying the phases separately?