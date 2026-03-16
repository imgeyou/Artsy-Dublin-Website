INSERT INTO usergender (`genderId`,`genderName`) VALUES
(1, 'Male'),
(2, 'Female'),
(3, 'Non-binary'),
(4, 'Prefer Not To Say');

INSERT INTO userlocation (`locationId`, `locationName`) VALUES
(1, 'Dublin 1'),
(2, 'Dublin 2'),
(3, 'Dublin 3'),
(4, 'Dublin 4'),
(5, 'Dublin 5'),
(6, 'Dublin 6'),
(7, 'Dublin 7'),
(8, 'Dublin 8'),
(9, 'Dublin 9'),
(10, 'Dublin 10'),
(11, 'Dublin 11'),
(12, 'Dublin 12'),
(13, 'Dublin 13'),
(14, 'Dublin 14'),
(15, 'Dublin 15'),
(16, 'Dublin 16'),
(17, 'Dublin 17'),
(18, 'Dublin 18'),
(19, 'Dublin 19'),
(20, 'Dublin 20'),
(21, 'Dublin 21'),
(22, 'Dublin 22'),
(23, 'Dublin 23'),
(24, 'Dublin 24');

--events data 
INSERT INTO events (title, description, posterUrl, attendCount, reviewCount, saveCount) VALUES
('Dublin Jazz Night', 'A evening of live jazz performances at the heart of Dublin city', 'https://placeholder.com/jazz.jpg', 2, 1, 0),
('Contemporary Art Exhibition', 'Showcasing emerging Irish artists working in mixed media and sculpture', 'https://placeholder.com/art.jpg', 2, 0, 0),
('Irish Theatre Festival', 'A celebration of new Irish writing performed by local theatre companies', 'https://placeholder.com/theatre.jpg', 2, 0, 0),
('Photography Walk Dublin', 'Guided photography tour through Dublins most iconic streets and hidden gems', 'https://placeholder.com/photo.jpg', 2, 1, 0),
('Traditional Music Session', 'An open traditional Irish music session welcoming all skill levels', 'https://placeholder.com/trad.jpg', 1, 1, 0);

--user data
INSERT INTO users (userName, email, passwordHash, birthday, location, bio, gender) VALUES
('alice', 'alice@email.com', 'hashedpw123', '1998-03-15', 1, 'Art lover based in Dublin', 1),
('bob', 'bob@email.com', 'hashedpw456', '1992-07-22', 2, 'Music and theatre enthusiast', 2),
('siobhan', 'siobhan@email.com', 'hashedpw789', '2000-11-05', 1, 'Love discovering hidden Dublin gems', 1),
('conor', 'conor@email.com', 'hashedpwxyz', '1995-01-30', 3, 'Photography and gallery visits', 2),
('emma', 'emma@email.com', 'hashedpwabc', '2001-06-18', 2, 'Dance and performance art fan', 1);

-- Event Attended
INSERT INTO eventAttended (eventAttendId, userId, eventId, attendedAt, createdAt, rating) VALUES
(1,  1, 1, '2025-11-15 19:00:00', '2026-02-21 00:55:47', 5),
(2,  2, 3, '2025-11-20 18:30:00', '2026-02-21 00:55:47', 4),
(3,  3, 2, '2025-12-01 20:00:00', '2026-02-21 00:55:47', 5),
(4,  4, 1, '2025-11-15 19:00:00', '2026-02-21 00:55:47', 3),
(5,  5, 3, '2025-11-20 18:30:00', '2026-02-21 00:55:47', 4),
(6,  1, 5, '2025-12-10 17:00:00', '2026-02-21 00:55:47', 5),
(7,  2, 4, '2025-12-05 19:30:00', '2026-02-21 00:55:47', 3),
(26, 1, 2, '2026-03-13 10:04:40', '2026-03-13 10:04:40', 2);

-- Post Types
INSERT INTO postType (typeId, typeName) VALUES
(1, 'post'),
(2, 'comment');

-- Posts (reviews on events/comments)
INSERT INTO posts (postId, type, userId, eventId, postParentId, content, likeCount, commentCount, isDeleted, deletedAt, createdAt, updatedAt, eventAttendId) VALUES
(1,  1, 1, 1,    NULL, 'Amazing jazz night, the atmosphere was electric and the musicians were incredible!', 2, 1, 0, NULL, '2026-02-21 01:01:53', NULL, 1),
(2,  1, 2, 3,    NULL, 'Great theatre festival, really enjoyed the performances and the venue was stunning.', 2, 1, 1, '2026-02-21 01:06:53', '2026-02-21 01:01:53', NULL, 2),
(3,  2, 3, NULL,    1,    'Loved the contemporary dance show, the choreography was breathtaking!',              2, 1, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(4,  2, 4, NULL,    2,    'Cannot wait to attend this event, it looks absolutely fantastic!',                  1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(5,  1, 5, 4,    NULL, 'The photography walk was a wonderful experience, captured some great shots of Dublin.', 1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, 3),
(6,  2, 1, NULL,    3,    'Traditional music session was so authentic, loved every moment of it.',             1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(7,  1, 2, 5,    NULL, 'Brilliant evening, highly recommend this event to anyone who loves live music!',    2, 0, 0, NULL, '2026-02-21 01:01:53', NULL, 4);

-- Posts images (come with reviews/comments)
INSERT INTO postImages (postImageId, imageUrl, postId) VALUES
-- post 1 (2 images)
(1,  'uploads/postImages/userUploads01.jpg', 1),
(2,  'uploads/postImages/userUploads02.jpg', 1),
-- post 2 (2 images)
(3,  'uploads/postImages/userUploads03.jpg', 2),
(4,  'uploads/postImages/userUploads04.jpg', 2),
-- post 5 (2 images)
(5,  'uploads/postImages/userUploads05.jpg', 5),
(6,  'uploads/postImages/userUploads01.jpg', 5),
-- post 6 (1 image)
(7,  'uploads/postImages/userUploads02.jpg', 6),
-- post 7 (2 images)
(8,  'uploads/postImages/userUploads03.jpg', 7),
(9,  'uploads/postImages/userUploads04.jpg', 7);

  
-- Post Likes (postIds 1-7 from above)
INSERT INTO postLikes (likeId, userId, postId, postLikedAt) VALUES
(1,  2, 1,  '2026-02-21 01:01:53'),
(2,  3, 1,  '2026-02-21 01:01:53'),
(3,  1, 2,  '2026-02-21 01:01:53'),
(4,  4, 2,  '2026-02-21 01:01:53'),
(5,  5, 3,  '2026-02-21 01:01:53'),
(6,  1, 3,  '2026-02-21 01:01:53'),
(7,  3, 4,  '2026-02-21 01:01:53'),
(8,  2, 5,  '2026-02-21 01:01:53'),
(9,  4, 6,  '2026-02-21 01:01:53'),
(10, 5, 7,  '2026-02-21 01:01:53'),
(11, 1, 7,  '2026-02-21 01:01:53');
