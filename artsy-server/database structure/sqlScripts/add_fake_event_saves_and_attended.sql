-- Event Saves
INSERT INTO eventSaves (userId, eventId, wantBuddy) VALUES
(1, 2, 1),
(2, 1, 0),
(3, 3, 1),
(4, 5, 0),
(5, 4, 1),
(1, 4, 0),
(3, 1, 1);

-- Event Attended
INSERT INTO eventAttended (userId, eventId, attendedAt, rating) VALUES
(1, 1, '2025-11-15 19:00:00', 5),
(2, 3, '2025-11-20 18:30:00', 4),
(3, 2, '2025-12-01 20:00:00', 5),
(4, 1, '2025-11-15 19:00:00', 3),
(5, 3, '2025-11-20 18:30:00', 4),
(1, 5, '2025-12-10 17:00:00', 5),
(2, 4, '2025-12-05 19:30:00', 3);