// this is where we handle all raw data relating to posts (including diary (event reviews) and comments)

//**NOTE-CHANGES TO DATABASE STRUCTURE:
// 1. three new columns added to the TABLE posts: likeCount, commentCount, eventAttendId (foreign key);
// 2. one column deleted from eventAttended: postId
// 3. three columns added to the event table: reviewCount, saveCount, attendCount
// 4. one column added to the eventAttended table: isDleted

const path = require('path');
require('dotenv').config({path: path.join(__dirname, '..', '.env')});

//import dbconfig and mysql2 pool (instead of node-querybuilder) 
const dbconfig = require("../utils/dbconfig");
const mysql = require('mysql2/promise');

// still one pool shared across all methods. not recreated per request
const pool = mysql.createPool(dbconfig);

class postsModel {
//A. get methods
    //A1. get all the posts based on filter (only reviews, no comments.)
    async getAllPostsBy(filters = {}){
        let que;
        try{
            que = await pool.getConnection();

            const [results] = await que.query(`
                SELECT posts.postId, posts.content, posts.createdAt, users.username,
                       events.eventId, events.title, eventAttended.rating,
                       posts.likeCount, posts.commentCount
                FROM posts
                JOIN postType ON posts.type = postType.typeId
                JOIN users ON posts.userId = users.userId
                JOIN events ON posts.eventId = events.eventId
                JOIN eventAttended ON posts.eventAttendId = eventAttended.eventAttendId
                WHERE postType.typeName = 'post'
                AND posts.isDeleted = 0
                AND posts.userId = COALESCE(?, posts.userId)
                AND posts.eventId = COALESCE(?, posts.eventId)
            `, [filters.userId ?? null, filters.eventId ?? null]);

            //attach imageUrls to the "images" attribute of the post object
            await this._attachImages(que, results);
            return results;

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //A2. get posts by postId. (showing post details, including comments and their nested comments)
    async getPostById(postid){
        let que;
        try{
            que = await pool.getConnection();
            const [result] = await que.query(`
                SELECT posts.postId, posts.eventId, posts.content, posts.createdAt,
                       users.username, events.eventId, events.title,
                       eventAttended.rating, posts.likeCount, posts.commentCount
                FROM posts
                JOIN postType ON posts.type = postType.typeId
                JOIN users ON posts.userId = users.userId
                JOIN events ON posts.eventId = events.eventId
                JOIN eventAttended ON posts.eventAttendId = eventAttended.eventAttendId
                WHERE posts.postId = ? AND postType.typeName = 'post' AND posts.isDeleted = 0
            `, [postid]);

            if(!result[0]) throw new Error('Post-not-found');
            const rootPostId = result[0].postId;

            //attach imageUrls to the "images" attribute of the post object
            await this._attachImages(que, result);

            //get all post comments (inclusing nested ones)
            const [allComments] = await que.query(`
                WITH RECURSIVE commentTree AS (
                /* base case: get direct comments */
                SELECT posts.postId, posts.postParentId, posts.content, posts.createdAt, users.userName, posts.likeCount, posts.commentCount
                FROM posts
                JOIN users ON posts.userId = users.userId
                WHERE posts.postParentId = ? AND posts.isDeleted = 0

                UNION ALL

                /* Recursive case: then get nested comments */
                SELECT p.postId, p.postParentId, p.content,
                p.createdAt, u.userName, p.likeCount, p.commentCount
                FROM posts p
                JOIN users u ON p.userId = u.userId
                JOIN commentTree ct ON p.postParentId = ct.postId
                WHERE p.isDeleted = 0)
                SELECT * FROM commentTree
            `, [rootPostId]);

            //attach imageUrls to the "images" attribute of the comment objects
            await this._attachImages(que, allComments);

            //define function: build comment tree
            function buildTree(allComments, rootPostId){
                return allComments
                .filter(c => c.postParentId === rootPostId) //get direct comments on the parent post
                .map(c=>({
                    ...c,
                    replies: buildTree(allComments, c.postId) //make nested comments (the replies to comments) stored in the arrtibute "replies" in its parent post object. Then repeat this process for all the comments replies.
                }))
            }
            //execute build comment tree function on the rootPost
            result[0].comments = buildTree(allComments, rootPostId);

            return result[0];

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //Helper: get post images for post
    async _attachImages(que, posts) {
        const postIds = posts.map(p => p.postId);
        if (postIds.length > 0) {
            const [postImages] = await que.query(
                `SELECT imageUrl, postId 
                FROM postImages 
                WHERE postId IN (?)
                `,[postIds]
            );
            posts.forEach(p => {
                p.images = postImages.filter(i => i.postId === p.postId).map(i => i.imageUrl);
            });
        } else {
            posts.forEach(p => { p.images = []; });
        }
    }

    //A3. get attendance status for a user on an event (called only when a user is logged-in)
    async getAttendanceStatus(userId, eventId) {
        let que;
        try {
            que = await pool.getConnection();
            const [result] = await que.query(
                `SELECT eventAttendId, rating 
                FROM eventattended 
                WHERE userId = ? 
                AND eventId = ? 
                AND isDeleted = 0
                `,[userId, eventId]
            );
            return result[0] ?? null; //null if not attended

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

//B. post methods
    //B1. log event attendance
    async logEvent(userId, eventId, attendedAt) {
        let que;
        try {
            que = await pool.getConnection();

            // check if a record already exists (active or soft-deleted)
            const [existing] = await que.query(
                `SELECT eventAttendId, isDeleted 
                FROM eventattended 
                WHERE userId = ? 
                AND eventId = ?
                `,[userId, eventId]
            );

            if (existing[0]) {
                if (existing[0].isDeleted === 0) throw new Error('already-attended');

                // restore the soft-deleted record with new date, clear old rating
                await que.query(
                    `UPDATE eventattended 
                    SET isDeleted = 0, attendedAt = ?, rating = NULL 
                    WHERE eventAttendId = ?
                    `,[attendedAt, existing[0].eventAttendId]
                );

                await que.query(
                    `UPDATE events 
                    SET attendCount = attendCount + 1, updatedAt = NOW() 
                    WHERE eventId = ?
                    `,[eventId]
                );

                return existing[0].eventAttendId;
            }

            // no existing record: insert a new one
            const [result] = await que.query(
                `INSERT INTO eventattended (userId, eventId, attendedAt) VALUES (?, ?, ?)`,
                [userId, eventId, attendedAt]
            );

            await que.query(
                `UPDATE events SET attendCount = attendCount + 1, updatedAt = NOW() WHERE eventId = ?`,
                [eventId]
            );

            return result.insertId;

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //B2. create post (reviw, diary)
    async createPost(userId, eventAttendId, eventId, content, images){
        let que;
        try {
            que = await pool.getConnection();
            //add a new entry to the TABLE posts
            const [result] = await que.query(
                `INSERT INTO posts (userId, eventAttendId, eventId, content, type) VALUES (?, ?, ?, ?, 1)`,
                [userId, eventAttendId, eventId, content]
            );

            //increment reviewCount in TABLE events
            await que.query(
                `UPDATE events 
                SET reviewCount = reviewCount + 1, updatedAt = NOW() 
                WHERE eventId = ?
                `,[eventId]
            );

            //get postId for the newly created post
            const postId = result.insertId;

            //add imageUrls to the TABLE postImages
            if (images.length) {
                const postImageEntries = images.map(url => [postId, url]);
                await que.query(`INSERT INTO postImages (postId, imageUrl) VALUES ?`, [postImageEntries]);
            }
            return postId;

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //B3. create comment
    async createComment(userId, postParentId, content, images){
        let que;
        try {
            que = await pool.getConnection();
            //add a new entry to the TABLE posts
            const [result] = await que.query(
                `INSERT INTO posts (userId, postParentId, content, type) VALUES (?, ?, ?, 2)`,
                [userId, postParentId, content]
            );

            //get postId for the newly created comment
            const postId = result.insertId;

            //increment commentCount in TABLE posts
            await que.query(
                `UPDATE posts 
                SET commentCount = commentCount + 1, updatedAt = NOW() 
                WHERE postId = ?`,[postParentId]
            );

            //add imageUrls to the TABLE postImages
            if (images.length) {
                const postImageEntries = images.map(url => [postId, url]);
                await que.query(`INSERT INTO postImages (postId, imageUrl) VALUES ?`, [postImageEntries]);
            }
            return postId;

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //B4. toggle between like/unlike a post
    async likeToggle(likePostId, likeUserId){
        let que;
        try{
            que = await pool.getConnection();
            const [result] = await que.query(
                `SELECT postId 
                FROM postLikes 
                WHERE postId = ? 
                AND userId = ?
                `,[likePostId, likeUserId]
            );

            if (result.length > 0) {
                await que.query(
                    `DELETE FROM postLikes 
                    WHERE postId = ? 
                    AND userId = ?
                    `,[likePostId, likeUserId]
                );

                //decrement likeCount in TABLE posts
                await que.query(
                    `UPDATE posts 
                    SET likeCount = likeCount - 1, updatedAt = NOW() 
                    WHERE postId = ?
                    `,[likePostId]
                );

                return false; //unlike

            } else {
                await que.query(
                    `INSERT INTO postLikes (postId, userId) VALUES (?, ?)`,
                    [likePostId, likeUserId]
                );

                //increment likeCount in TABLE posts
                await que.query(
                    `UPDATE posts 
                    SET likeCount = likeCount + 1, updatedAt = NOW() 
                    WHERE postId = ?
                    `,[likePostId]
                );

                return true; //like
            }
        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }

//C. patch methods
    //C1. update rating on an existing eventattended entry
    async updateRating(eventAttendId, rating) {
        let que;
        try {
            que = await pool.getConnection();
            //update rating in TABLE eventAttended, filter by the same eventAttendId
            const [result] = await que.query(
                `UPDATE eventattended 
                SET rating = ? 
                WHERE eventAttendId = ?
                `,[rating, eventAttendId]
            );

            if (result.affectedRows === 0) throw new Error('record-not-found');
        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que) que.release();
        }
    }

    //C2. edit post content
    async editPost(postId, content) {
        let que;
        try {
            que = await pool.getConnection();
            const [result] = await que.query(
                `UPDATE posts 
                SET content = ? 
                WHERE postId = ? 
                AND isDeleted = 0
                `,[content, postId]
            );

            if (result.affectedRows === 0) throw new Error('Post-not-found');

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }


//D. delete methods
    //D1. soft-delete a post (diary or comment) and all its nested comments
    async deletePost(postId) {
        let que;
        try {
            que = await pool.getConnection();

            // verify post exists and get its related data
            const [post] = await que.query(
                `SELECT postId, postParentId, eventId, type 
                FROM posts 
                WHERE postId = ? 
                AND isDeleted = 0
                `,[postId]
            );

            if (!post[0]) throw new Error('Post-not-found');

            // get all comments' postIds
            const [comments] = await que.query(`
                WITH RECURSIVE postTree AS (
                    SELECT postId FROM posts WHERE postId = ?
                    UNION ALL
                    SELECT p.postId FROM posts p
                    JOIN postTree pt ON p.postParentId = pt.postId
                    WHERE p.isDeleted = 0
                )
                SELECT postId FROM postTree
            `, [postId]);

            const commentsIds = comments.map(r => r.postId);

            // soft-delete all (post + all nested comments)
            await que.query(
                `UPDATE posts 
                SET isDeleted = 1, updatedAt = NOW() 
                WHERE postId IN (?)
                `,[commentsIds]
            );

            // alter counts
            if (post[0].type === 1) {
                // diary post: decrement event's reviewCount
                await que.query(
                    `UPDATE events 
                    SET reviewCount = GREATEST(reviewCount - 1, 0), updatedAt = NOW() 
                    WHERE eventId = ?
                    `,[post[0].eventId]
                );
            } else if (post[0].postParentId) {
                // comment: decrement direct parentPost's commentCount
                await que.query(
                    `UPDATE posts 
                    SET commentCount = GREATEST(commentCount - 1, 0), updatedAt = NOW() 
                    WHERE postId = ?
                    `,[post[0].postParentId]
                );
            }

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }

    //D2. soft-delete attendance log (+ soft-delete related posts)
    async deleteAttendance(eventAttendId) {
        let que;
        try {
            que = await pool.getConnection();
            // get eventId before deleting
            const [attendance] = await que.query(
                `SELECT eventId 
                FROM eventattended 
                WHERE eventAttendId = ?
                `,[eventAttendId]
            );

            if (!attendance[0]) throw new Error('record-not-found');

            const eventId = attendance[0].eventId;

            // soft-delete any posts linked to this attendance
            const [linkedPosts] = await que.query(
                `SELECT postId 
                FROM posts 
                WHERE eventAttendId = ?
                `,[eventAttendId]
            );

            if (linkedPosts.length > 0) {
                //linkedPosts: set isDeleted to 1
                await que.query(
                    `UPDATE posts 
                    SET isDeleted = 1, updatedAt = NOW() 
                    WHERE eventAttendId = ?
                    `,[eventAttendId]
                );
                // alter counts: decrement event's reviewCount
                await que.query(
                    `UPDATE events 
                    SET reviewCount = GREATEST(reviewCount - ?, 0), updatedAt = NOW() 
                    WHERE eventId = ?
                    `,[linkedPosts.length, eventId]
                );
            }

            // alter counts: decrement event's attendCount
            await que.query(
                `UPDATE events 
                SET attendCount = GREATEST(attendCount - 1, 0), updatedAt = NOW() 
                WHERE eventId = ?
                `,[eventId]
            );

            //attendance: set isDeleted to 1
            await que.query(
                `UPDATE eventattended 
                SET isDeleted = 1 
                WHERE eventAttendId = ?
                `,[eventAttendId]
            );

        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }

}

module.exports = new postsModel();
