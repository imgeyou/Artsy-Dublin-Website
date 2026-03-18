// this is the router for posts related stuff

const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// get routes
router.get('/', postsController.getAllPosts);
router.get('/event/:eventId', postsController.getPostsByEvent);
router.get('/user/:userId', postsController.getPostsByUser);
router.get('/:postId', postsController.getPostById);

// images now handled inside postsController via processUploadedImages
router.post('/post/:eventAttendedId', postsController.createPost);
router.post('/comment/:parentPostId', postsController.createComment);

// interactions
router.post('/:postId/like', postsController.likeToggle);
router.patch('/:postId', postsController.editPost);
router.delete('/:postId', postsController.deletePost);

// attendance
router.get("/:eventId/attend", postsController.getAttendanceStatus);
router.post("/:eventId/attend", postsController.logEvent);
router.delete("/:eventAttendId/attend", postsController.deleteAttendance);
router.patch("/:eventAttendId/rating", postsController.updateRating);

module.exports = router;