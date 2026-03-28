3.28

Migrated user authentication from JWT to Firebase

Added Firebase Admin SDK integration in index.js

Replaced passwordHash with firebaseUid in users table and model

Added GET /users/:username endpoint to fetch user profile

Added GET /users/:username/posts endpoint for user diary posts

Added GET /users/:username/attended-events endpoint for attended events

Added GET /users/:username/stats endpoint for review statistics

Added GET /users/:username/journal endpoint for journal entries with sort support

Added GET /api/check-auth endpoint for Firebase token verification

Removed JWT login route and bcrypt password handling
