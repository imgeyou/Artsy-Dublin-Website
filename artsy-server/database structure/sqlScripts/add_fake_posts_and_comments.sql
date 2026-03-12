-- Posts (reviews/comments on events)
INSERT INTO posts (type, userId, eventId, content) VALUES
(1, 1, 1, 'Amazing jazz night, the atmosphere was incredible!'),
(1, 2, 3, 'Great theatre festival, really impressive performances'),
(2, 3, 2, 'Loved the contemporary art exhibition, very inspiring'),
(2, 4, 1, 'Cannot wait to attend this again next year'),
(1, 5, 4, 'The photography walk was so well organised'),
(2, 1, 5, 'Traditional music session was so much fun!'),
(1, 2, 5, 'Brilliant evening, highly recommend to everyone');

-- Post Likes (postIds 1-7 from above)
INSERT INTO postLikes (userId, postId) VALUES
(2, 1),
(3, 1),
(1, 2),
(4, 2),
(5, 3),
(1, 3),
(3, 4),
(2, 5),
(4, 6),
(5, 7),
(1, 7);