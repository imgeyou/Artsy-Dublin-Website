// this is where we handle all raw data relating to posts (including diary (event reviews) and comments)

//**NOTE-CHANGES TO DATABASE STRUCTURE: 
// 1. three new columns added to the TABLE posts: likeCount, commentCount, eventAttendId (foreign key); 
// 2. one column deleted from eventAttended: postId
// 3. three columns added to the event table: reviewCount, saveCount, attendCount
// 4. one column added to the eventAttended table: isDleted

const path = require('path');
const dotenv = require('dotenv').config({path: path.join(__dirname, '..', '.env')});
const axios = require('axios');

//import node-querybuilder and configure file
const dbconfig = require("../utils/dbconfig");
const queryBuilder = require("node-querybuilder");

// one pool shared across all methods. never recreated per request
const pool = new queryBuilder(dbconfig, "mysql", "pool");

class postsModel {
//A. get methods
    //A1. get all the posts based on filter (only reviews, no comments.)
    async getAllPostsBy(filters = {}){
        let que;
        try{
            que = await pool.get_connection();
            let qr = que
                .select('posts.postId, posts.content, posts.createdAt, users.username, events.eventId, events.title, eventAttended.rating, posts.likeCount, posts.commentCount')
                .join('postType', 'posts.type = postType.typeId')
                .join('users', 'posts.userId = users.userId')
                .join('events', 'posts.eventId = events.eventId')
                .join('eventAttended', 'posts.eventAttendId = eventAttended.eventAttendId')
                .where('postType.typeName', 'post')
                .where('posts.isDeleted', 0)
                if (filters.userId){qr =qr.where('posts.userId',  filters.userId)};
                if (filters.eventId){qr = qr.where('posts.eventId', filters.eventId)};
            
            const results = await qr.get('posts'); 
            //note: node-querybuilder's .get() returns an array directly. no need to deconstruct
            
            //attach imageUrls to the "images" attribute of the post object
            await this._attachImages(que, results);
            return results;

        }
        catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if(que)que.release();
        }
    }

    //A2. get posts by postId. (showing post details, including comments and their nested comments)
    async getPostById(postid){
        let que;
        try{
            que = await pool.get_connection();
            const result = await que
                .select('posts.postId, posts.eventId, posts.content, posts.createdAt, users.username, events.eventId, events.title, eventAttended.rating, posts.likeCount, posts.commentCount')
                .join('postType', 'posts.type = postType.typeId')
                .join('users', 'posts.userId = users.userId')
                .join('events', 'posts.eventId = events.eventId')
                .join('eventAttended', 'posts.eventAttendId = eventAttended.eventAttendId')
                .where('posts.postId', postid) //filter by id
                .where('postType.typeName', 'post')
                .where('posts.isDeleted', 0)
                .get('posts');
            
            if(!result[0]) throw new Error('Post-not-found');
            const rootPostId = result[0].postId;

            //attach imageUrls to the "images" attribute of the post object
            await this._attachImages(que, result);

            //get all post comments (inclusing nested ones)
            const allComments = await que.query(`
                WITH RECURSIVE commentTree AS (
                /* base case: get direct comments */
                SELECT posts.postId, posts.postParentId, posts.content, posts.createdAt, users.userName, posts.likeCount, posts.commentCount
                FROM posts
                JOIN users ON posts.userId = users.userId
                WHERE posts.postParentId = ${rootPostId} AND posts.isDeleted = 0

                UNION ALL

                /* Recursive case: then get nested comments */
                SELECT p.postId, p.postParentId, p.content,
                p.createdAt, u.userName, p.likeCount, p.commentCount
                FROM posts p
                JOIN users u ON p.userId = u.userId
                JOIN commentTree ct ON p.postParentId = ct.postId
                WHERE p.isDeleted = 0)
                SELECT * FROM commentTree
            `)

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
            if(que)que.release();
        }
    }

    //Helper: get post images for post
    async _attachImages(que, posts) {
        const postIds = posts.map(p => p.postId);
        if (postIds.length > 0) { 
            const postImages = await que
                .select('imageUrl, postId')
                .where_in('postId', postIds)
                .get('postImages');
            posts.forEach(p => {
                p.images = postImages.filter(i => i.postId === p.postId).map(i => i.imageUrl);
            });
        } else {
            posts.forEach(p=>{p.images = [];})
        } 
    }
    
    //A3. get attendance status for a user on an event (called only when a user is logged-in)
    async getAttendanceStatus(userId, eventId) {
        let que;
        try {
            que = await pool.get_connection();
            //try to get the attendance log from TABLE eventAttended
            const result = await que
                .select('eventAttendId, rating')
                .where('userId', userId)
                .where('eventId', eventId)
                .where('isDeleted', 0)
                .get('eventattended');

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
            que = await pool.get_connection();

            // check if a record already exists (active or soft-deleted)
            const existing = await que
                .where('userId', userId)
                .where('eventId', eventId)
                .get('eventattended');

            if (existing[0]) {
                if (existing[0].isDeleted === 0) throw new Error('already-attended');

                // restore the soft-deleted record with new date, clear old rating
                await que.query(`
                    UPDATE eventattended SET isDeleted = 0, attendedAt = '${attendedAt}', rating = NULL
                    WHERE eventAttendId = ${parseInt(existing[0].eventAttendId)}
                `);

                await que.query(`UPDATE events SET attendCount = attendCount + 1, updatedAt = NOW() WHERE eventId = ${parseInt(eventId)}`);
               
                return existing[0].eventAttendId;
            }

            // no existing record: insert a new one
            const result = await que.insert('eventattended', { userId, eventId, attendedAt });

            await que.query(`UPDATE events SET attendCount = attendCount + 1, updatedAt = NOW() WHERE eventId = ${parseInt(eventId)}`);

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
            que = await pool.get_connection();
            //add a new entry to the TABLE posts
            const result = await que.insert('posts', { userId, eventAttendId, eventId, content, type: 1 });

            //increment reviewCount in TABLE events
            await que.query(`UPDATE events SET reviewCount = reviewCount + 1, updatedAt = NOW() WHERE eventId = ${parseInt(eventId)}`);

            //get postId for the newly created post
            const postId = result.insertId;

            //add imageUrls to the TABLE postImages
            if (images.length) {
                const postImageEntries = images.map(url => ({ postId, imageUrl: url }));
                await que.insert('postImages', postImageEntries);//array->bulk insert multiple entries
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
            que = await pool.get_connection();
            //add a new entry to the TABLE posts
            const result = await que.insert('posts', {userId, postParentId, content, type: 2});
            
            //get postId for the newly created comment
            const postId = result.insertId;

            //increment commentCount in TABLE posts
            await que.query(`UPDATE posts SET commentCount = commentCount + 1, updatedAt = NOW() WHERE postId = ${parseInt(postParentId)}`);

            //add imageUrls to the TABLE postImages
            if (images.length) {
                const postImageEntries = images.map(url => ({ postId, imageUrl: url }));
                await que.insert('postImages', postImageEntries);
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
            que = await pool.get_connection();
            const result = await que
                .where({'postLikes.postId': likePostId, 'postLikes.userId': likeUserId})
                .get('postLikes');

            if (result.length > 0) {
                await que
                    .where({ 'postLikes.postId': likePostId, 'postLikes.userId': likeUserId })
                    .delete('postLikes'); //hard delete
                
                //decrement likeCount in TABLE posts
                await que.query(`UPDATE posts SET likeCount = likeCount - 1, updatedAt = NOW() WHERE postId = ${parseInt(likePostId)}`);

                return false; //unlike

            } else {
                await que.insert('postLikes', { postId: likePostId, userId: likeUserId });

                //increment likeCount in TABLE posts
                await que.query(`UPDATE posts SET likeCount = likeCount + 1, updatedAt = NOW() WHERE postId = ${parseInt(likePostId)}`);

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
            que = await pool.get_connection();
            //update rating in TABLE eventAttended, filter by the same eventAttendId
            const result = await que
                .where('eventAttendId', eventAttendId)
                .update('eventattended', { rating });
            
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
            que = await pool.get_connection();
            const result = await que
                .where('postId', postId)
                .where('isDeleted', 0)
                .update('posts', { content });

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
            que = await pool.get_connection();

            // verify post exists and get its related data
            const post = await que
                .select('postId, postParentId, eventId, type')
                .where('postId', postId)
                .where('isDeleted', 0)
                .get('posts');

            if (!post[0]) throw new Error('Post-not-found');

            // get all comments' postIds
            const comments = await que.query(`
                WITH RECURSIVE postTree AS (
                    SELECT postId FROM posts WHERE postId = ${parseInt(postId)}
                    UNION ALL
                    SELECT p.postId FROM posts p
                    JOIN postTree pt ON p.postParentId = pt.postId
                    WHERE p.isDeleted = 0
                )
                SELECT postId FROM postTree
            `);
                
            const commentsIds = comments.map(r => r.postId);

            // soft-delete all (post + all nested comments)
            await que.query(`
                UPDATE posts SET isDeleted = 1, updatedAt = NOW()
                WHERE postId IN (${commentsIds.join(',')})
            `);

            // alter counts
            if (post[0].type === 1) {
                // diary post: decrement event's reviewCount
                await que.query(`UPDATE events SET reviewCount = GREATEST(reviewCount - 1, 0), updatedAt = NOW() WHERE eventId = ${parseInt(post[0].eventId)}`);

            } else if (post[0].postParentId) {
                // comment: decrement direct parentPost's commentCount
                await que.query(`UPDATE posts SET commentCount = GREATEST(commentCount - 1, 0), updatedAt = NOW() WHERE postId = ${parseInt(post[0].postParentId)}`);
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
            que = await pool.get_connection();
            // get eventId before deleting
            const attendance = await que
                .select('eventId')
                .where('eventAttendId', eventAttendId)
                .get('eventattended');
            
            if (!attendance[0]) throw new Error('record-not-found');
            
            const eventId = attendance[0].eventId;

            // soft-delete any posts linked to this attendance
            const linkedPosts = await que
                .select('postId')
                .where('eventAttendId', eventAttendId)
                .get('posts');

            if (linkedPosts.length > 0) {
                //linkedPosts: set isDeleted to 1
                await que.query(`UPDATE posts SET isDeleted = 1, updatedAt = NOW() WHERE eventAttendId = ${parseInt(eventAttendId)}`);
                // alter counts: decrement event's reviewCount
                await que.query(`UPDATE events SET reviewCount = GREATEST(reviewCount - ${linkedPosts.length}, 0), updatedAt = NOW() WHERE eventId = ${parseInt(eventId)}`);
            }
           
            // alter counts: decrement event's attendCount
            await que.query(`UPDATE events SET attendCount = GREATEST(attendCount - 1, 0), updatedAt = NOW() WHERE eventId = ${parseInt(eventId)}`);

            //attendance: set isDeleted to 1
            await que.query(`UPDATE eventattended SET isDeleted = 1 WHERE eventAttendId = ${parseInt(eventAttendId)}`);

            
        } catch (err) {
            console.error("Query Error: " + err);
            throw err;
        } finally {
            if (que) que.release();
        }
    }

}

module.exports = new postsModel();