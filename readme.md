## Plan ##
(Set up)
- create client/server folders
- npm install react
- npm create vite@latest
- client > package.json > "proxy": "http://localhost:3005",
- client > npm install axios
- ??bootstrap
- npm install react-router-dom (for frontend router)
- run backend server first, then run frontend server

(scaffold)
client/src/
│
├── App.jsx ← routing shell, imports all page-level components
├── main.jsx
│
├── services/
│   ├── postsService.js     ← GET/POST/PUT/DELETE /posts
│   ├── eventsService.js    ← GET/POST/PUT/DELETE /events
│   ├── usersService.js     ← POST /users, POST /users/login, GET /users/:id
│   └── likeService.js      ← POST/DELETE /like
│
└── components/
    │
    ├── shared/
    │   ├── Navbar.jsx     ← imported by App.jsx, appears on every route
    │   └── Footer.jsx     ← imported by App.jsx, appears on every route
    │
    ├── posts/
    │   ├── PostList.jsx             ← imports PostCard · calls postsService.getPosts
    │   ├── PostCard.jsx             ← imports LikeButton · used by PostList + EventDetail
    │   ├── PostForm.jsx             ← calls postsService.createPost / updatePost
    │   ├── PostDetail.jsx           ← imports PostCard + CommentList + CommentForm · calls postsService.getPostById
    │   ├── LikeButton.jsx           ← calls likeService · used by PostCard + PostDetail
    │   └── comments/
    │       ├── CommentList.jsx      ← imports CommentItem · used by PostDetail
    │       ├── CommentItem.jsx      ← imports itself (recursive for replies) + CommentForm
    │       └── CommentForm.jsx      ← calls postsService.addComment · used by PostDetail + CommentItem
    │
    ├── events/
    │   ├── EventList.jsx            ← imports EventCard · calls eventsService.getEvents
    │   ├── EventCard.jsx            ← used by EventList
    │   ├── EventForm.jsx            ← calls eventsService.createEvent / updateEvent
    │   └── EventDetail.jsx          ← imports PostList (filtered by eventId) · calls eventsService.getEventById
    │
    └── users/
        ├── UserProfile.jsx          ← imports PostList (filtered by userId) · calls usersService.getUser
        ├── LoginForm.jsx            ← calls usersService.login
        └── RegisterForm.jsx         ← calls usersService.register
