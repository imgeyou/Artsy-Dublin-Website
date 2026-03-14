-- Posts (reviews on events/comments)
INSERT INTO posts (postId, type, userId, eventId, postParentId, content, likeCount, commentCount, isDeleted, deletedAt, createdAt, updatedAt, eventAttendId) VALUES
(1,  1, 1, 1,    NULL, 'Amazing jazz night, the atmosphere was electric and the musicians were incredible!', 2, 1, 0, NULL, '2026-02-21 01:01:53', NULL, 1),
(2,  1, 2, 3,    NULL, 'Great theatre festival, really enjoyed the performances and the venue was stunning.', 2, 1, 1, '2026-02-21 01:06:53', '2026-02-21 01:01:53', NULL, 2),
(3,  2, 3, NULL,    1,    'Loved the contemporary dance show, the choreography was breathtaking!',              2, 1, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(4,  2, 4, NULL,    2,    'Cannot wait to attend this event, it looks absolutely fantastic!',                  1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(5,  1, 5, 4,    NULL, 'The photography walk was a wonderful experience, captured some great shots of Dublin.', 1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, 3),
(6,  2, 1, NULL,    3,    'Traditional music session was so authentic, loved every moment of it.',             1, 0, 0, NULL, '2026-02-21 01:01:53', NULL, NULL),
(7,  1, 2, 5,    NULL, 'Brilliant evening, highly recommend this event to anyone who loves live music!',    2, 0, 0, NULL, '2026-02-21 01:01:53', NULL, 4),

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
(9,  'uploads/postImages/userUploads04.jpg', 7),
-- post 18 (1 image)
(10, 'uploads/postImages/userUploads05.jpg', 18),
-- post 22 (1 image)
(11, 'uploads/postImages/userUploads01.jpg', 22),
-- post 25 (2 images)
(12, 'uploads/postImages/userUploads02.jpg', 25),
(13, 'uploads/postImages/userUploads03.jpg', 25);
  
-- Post Likes (postIds 1-7 from above)
INSERT INTO likes (likeId, userId, postId, postLikedAt) VALUES
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
(11, 1, 7,  '2026-02-21 01:01:53'),

-- Post Types
INSERT INTO postTypes (typeId, typeName) VALUES
(1, 'post'),
(2, 'comment');
