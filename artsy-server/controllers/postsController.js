// this is the controller for posts related stuff
// TODO: userId replaced with req.session.userId (after we set up the user log-in function)


//import models
const postsModel = require("../models/posts.js");
const { processUploadedImages } = require("./imagesController");

class postsController{

//A. get methods
    //A1. get all the posts (only diaries, no comments.)
    async getAllPosts(req, res){
        try {
            const filters = {};
            const allPosts = await postsModel.getAllPostsBy(filters);
            res.json(allPosts);
        } catch (err) {
            console.error(err); 
            res.status(500).json({ error: 'Server error' });
        }
    }

    //A2. get post by eventId
    async getPostsByEvent(req, res){
        try {
            const filters = {};
            filters.eventId = req.params.eventId;
            const allPosts = await postsModel.getAllPostsBy(filters);
            res.json(allPosts);
        } catch (err) {
            console.error(err); 
            res.status(500).json({ error: 'Server error' });
        }
    }

    //A3. get post by userId
    async getPostsByUser(req, res){
        try {
            const filters = {};
            filters.userId = req.params.userId;
            const allPosts = await postsModel.getAllPostsBy(filters);
            res.json(allPosts);
        } catch (err) {
            console.error(err); 
            res.status(500).json({ error: 'Server error' });
        }
    }

    //A4. get post by postId
    async getPostById(req, res){
        try {
            const post = await postsModel.getPostById(req.params.postId);
            res.json(post);
        } catch (err) {
            if (err.message === 'Post-not-found') {
                res.status(404).json({ error: 'Post not found' });
            } else {
                console.error(err);
                res.status(500).json({ error: 'Server error' });
            }
        }
    }

    //A5. get attendance status (run when an event page is loaded and a user is logged-in)
    async getAttendanceStatus(req, res){
        try {
            const userId = 1; // TODO: replace with req.session.userId
            const attendanceStatus = await postsModel.getAttendanceStatus(userId, req.params.eventId);
            res.json(attendanceStatus); // null if not attended, otherwise return {eventAttendId, rating}
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }

//B. post method
    //B1. log event attendance - remember to check attendance status before
    async logEvent(req, res){
        try {
            const eventId = req.params.eventId;
            const { attendedAt } = req.body;
            const userId = 1; // TODO: replace with req.session.userId

            const eventAttendId = await postsModel.logEvent(userId, eventId, attendedAt);

            res.status(201).json({ eventAttendId }); //return id for frontend to use in next steps

        } catch (err) {
            if (err.message === 'already-attended') {
                res.status(409).json({ error: 'Already attended' });
            } else {
                console.error(err);
                res.status(500).json({ error: 'Server error' });
            }
        }
    }

    //B2. create post (review, diary) - need to get eventAttendId first
    async createPost(req, res){
        try {
            const eventAttendedId = req.params.eventAttendedId;
            const userId = 1; // TODO: replace with req.session.userId
            const { content, eventId } = req.body;
            const imageUrls = await processUploadedImages(req.files);
            const postId = await postsModel.createPost(userId, eventAttendedId, eventId, content, imageUrls);
            res.status(201).json({ postId });
        } catch (err) { //informative error msgs on image upload
     if (err.message.includes('Maximum amount of images') ||
        err.message.includes('invalid image format') ||
        err.message.includes('exceeds the allowed')) {
        return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error:'Server error' });
        }
    }

    //B3. create comment
    async createComment(req, res){
        try {
            const postParentId = req.params.parentPostId;
            const userId = 1; // TODO: replace with req.session.userId
            const { content } = req.body;
            const imageUrls = await processUploadedImages(req.files);
            const postId = await postsModel.createComment(userId, postParentId, content, imageUrls);
            res.status(201).json({ postId });
       } catch (err) { //informative error msgs on image upload
     if (err.message.includes('Maximum amount of images') ||
        err.message.includes('invalid image format') ||
        err.message.includes('exceeds the allowed')) {
        return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error:'Server error' });
       }
    }

    //B4. Toggle like/unlike a post
    async likeToggle(req, res){
        try {
            const userId = 1; // TODO: replace with req.session.userId
            const { liked, likeCount } = await postsModel.likeToggle(req.params.postId, userId);
            res.json({ liked, likeCount });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }

//C. patch methods
    //C1. update rating on an existing eventattended entry - need to get eventAttendId before
    async updateRating(req, res){
        try {
            const eventAttendId = req.params.eventAttendId;
            const { rating } = req.body;
            await postsModel.updateRating(eventAttendId, rating);
            res.json({ message: 'Rating updated' });
        } catch (err) {
            if (err.message === 'record-not-found') {
                res.status(404).json({ error: 'Attendance record not found' });
            } else {
                res.status(500).json({ error: 'Server error' });
            }
        }
    }
    
    //C2. edit post content
    async editPost(req, res){
        try {
            const userId = 1; // TODO: replace with req.session.userId
            const { content } = req.body;
            await postsModel.editPost(req.params.postId, userId, content);
            res.json({ message: 'Post updated' });
        } catch (err) {
            if (err.message === 'Post-not-found') {
                res.status(404).json({ error: 'Post not found' });
            } else if (err.message === 'Not-authorized') {
                res.status(403).json({ error: 'You can only edit your own posts' });
            } else {
                console.error(err);
                res.status(500).json({ error: 'Server error' });
            }
        }
    }
//D. delete methods
    //D1. soft-delete a post or comment (and its nested comments)
    async deletePost(req, res){
        try {
            const userId = 1; // TODO: replace with req.session.userId
            await postsModel.deletePost(req.params.postId, userId);
            res.json({ message: 'Post deleted' });
        } catch (err) {
            if (err.message === 'Post-not-found') {
                res.status(404).json({ error: 'Post not found' });
            } else if (err.message === 'Not-authorized') {
                res.status(403).json({ error: 'You can only delete your own posts' });
            } else {
                console.error(err);
                res.status(500).json({ error: 'Server error' });
            }
        }
    }

    //D2. soft-delete attendance log
    async deleteAttendance(req, res){
        try {
            await postsModel.deleteAttendance(req.params.eventAttendId);
            res.json({ message: 'Attendance record deleted' });
        } catch (err) {
            if (err.message === 'record-not-found') {
                res.status(404).json({ error: 'Attendance record not found' });
            } else {
                res.status(500).json({ error: 'Server error' });
            }
        }
    }

    
}

module.exports = new postsController();

