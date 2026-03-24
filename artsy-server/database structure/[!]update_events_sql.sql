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