// this is the router for posts related stuff

const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const {authenticate} = require("../controllers/authController");

// get routes
router.get('/', postsController.getAllPosts);
router.get('/event/:eventId', postsController.getPostsByEvent);
router.get('/user/:userId', postsController.getPostsByUser);
router.get('/:postId', postsController.getPostById);
router.get('/likes/check', authenticate, postsController.checkLikeStatusByPostId);
router.get('/saves/check', authenticate, postsController.checkSaveStatus);
router.get('/saves/user/:userId', postsController.getSavedEventsByUser);
router.get('/attend/user/:userId', postsController.getAttendedEventsByUser);

// images now handled inside postsController via processUploadedImages
router.use(authenticate);
router.post('/post/:eventAttendedId', postsController.createPost);
router.post('/comment/:parentPostId', postsController.createComment);

// interactions
router.post('/:postId/like', postsController.likeToggle);
router.post('/:eventId/save', postsController.saveToggle);
router.patch('/:postId', postsController.editPost); 
router.delete('/:postId', postsController.deletePost);

// attendance
router.get("/:eventId/attend", postsController.getAttendanceStatus);
router.post("/:eventId/attend", postsController.logEvent);
router.delete("/:eventAttendId/attend", postsController.deleteAttendance);
router.patch("/:eventAttendId/rating", postsController.updateRating);

module.exports = router;