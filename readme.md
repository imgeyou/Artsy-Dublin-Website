<h1>Artsy Dublin</h1>

_<h3>Find artsy events near you, tailored for you! Only in Dublin.</h3>_

_Website is a work in progress..._

<h4>THE TEAM</h4>
Backend team: Ge, Sengul, Krystyna, Astrid <br>
Frontend team: Emma, Brian

[3.28] - Astrid

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
