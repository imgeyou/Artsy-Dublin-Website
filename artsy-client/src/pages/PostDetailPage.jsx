//this is the detail page for single post

//import react functions
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkLikes, collectAllIds, applyLikedRecursive, updateCommentContent, removeComment } from "../utils/postHelpers";

//import backend api
//const API_BASE_URL = import.meta.env.VITE_API_URL;

//import icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

//import components
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Lightbox from "../components/posts/Lightbox";
import ReviewedEventCard from "../components/posts/ReviewedEventCard";
import PostDetailContent from "../components/posts/PostDetailContent";
import CommentSection from "../components/posts/CommentSection";
import LoginPrompt from "../components/common/LoginPrompt";

//import helpers
import { useAuth } from "../context/AuthContext";
import "../index.css";
import "../styles/pages/post-detail.css";


function PostDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams(); //get postId from para

    // ---- initialise use state
    const [post, setPost] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [accentColor, setAccentColor] = useState(null);

    const [lightbox, setLightbox] = useState(null); // { images, index }
    const [loginPrompt, setLoginPrompt] = useState(null); // message string or null

    const [postEditing, setPostEditing] = useState(false);
    const [postEditText, setPostEditText] = useState("");
    const [postDeleteConfirm, setPostDeleteConfirm] = useState(false);

    const commentsRef = useRef(null);
    const likeCheckedRef = useRef(false);

    const { dbUser } = useAuth(); //get login user info
    
    function requireAuth(message, action) {
        if (!dbUser) { setLoginPrompt(message); return; }
        action();
    }

    // ----- fetch post + reviewedEvent
    useEffect(() => {
        //handle data err
        const statusMessages = {
            400: "Bad request.",
            401: "Please log in to continue.",
            403: "You don't have permission to view this.",
            404: "Not found.",
            500: "Server error, please try again later.",
        };

        const parseResponse = async (res) => {
            if (!res.ok) {
                throw new Error(statusMessages[res.status] ?? `Unexpected error (${res.status}).`);
            }
            return res.json();
        };

        //if no err, fetch post + reviewedEvent
        async function fetchPost() {
            try {
                const res = await fetch(`/ad-posts/${id}`);
                const data = await parseResponse(res);
                setPost(data);
                setLikeCount(data.likeCount ?? 0);
                setComments(data.comments ?? []);

                if (data.eventId) {
                    const eventRes = await fetch(`/ad-events/event/${data.eventId}`);
                    if (eventRes.ok) setEvent(await eventRes.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [id]);

    // check likes for main post + every comment/reply once both are ready
    useEffect(() => {
        if (!post || !dbUser || likeCheckedRef.current) return;
        likeCheckedRef.current = true;

        checkLikes(collectAllIds(post, comments)).then((likedArr) => {
            setLiked(likedArr.includes(post.postId));
            setComments((prev) => applyLikedRecursive(prev, likedArr));
        });
    }, [post, dbUser]); // eslint-disable-line react-hooks/exhaustive-deps


// ----------------------------------- interaction handlers
    
    //open image in full screen
    function openLightbox(images, index) {
        setLightbox({ images, index });
    }
    function closeLightbox() { setLightbox(null); }


//---------------------------- interaction with the main post
    //handle like toggle for the main post
    async function handleLikeToggle() {
        try {
            const res = await fetch(`/ad-posts/${id}/like`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) return;
            const { liked: likeStatus, likeCount: newCount } = await res.json();
            setLiked(likeStatus);
            setLikeCount(newCount);
        } catch {
            // silent fail
        }
    }

    // edit the main post
    async function handlePostEdit() {
        try {
            const res = await fetch(`/ad-posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: postEditText }),
            });
            if (!res.ok) return;
            setPost((prev) => prev ? { ...prev, content: postEditText } : prev);
            setPostEditing(false);
        } catch {
            // keep form open on failure
        }
    }
    // delete the main post
    async function handlePostDelete() {
        try {
            const res = await fetch(`/ad-posts/${id}`, { method: "DELETE" });
            if (!res.ok) return;
            navigate("/posts");
        } catch {
            setPostDeleteConfirm(false);
        }
    }

    async function refreshComments() {
        const res = await fetch(`/ad-posts/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setComments(data.comments ?? []);
        setPost(prev => prev ? { ...prev, commentCount: data.commentCount } : prev);
    }

    //submit a comment to the main post
    async function handleCommentSubmit({ content, images }) {
        const form = new FormData();
        form.append('content', content);
        images.forEach(img => form.append('images', img));

        const res = await fetch(`/ad-posts/comment/${id}`, {
            method: 'POST',
            credentials: 'include',
            body: form
        });

        if (!res.ok) return;
        await refreshComments();
    }
    
// ----------------------------------interaction with a comment
    // like a comment
    async function handleLikeComment(commentPostId) {
        function applyLike(list, liked, likeCount) {
            return list.map((c) => {
                if (c.postId === commentPostId) return { ...c, liked, likeCount };
                if (c.replies?.length) return { ...c, replies: applyLike(c.replies, liked, likeCount) };
                return c;
            });
        }

        // Optimistic update
        let prevLiked, prevCount;
        setComments((prev) => {
            function findComment(list) {
                for (const c of list) {
                    if (c.postId === commentPostId) return c;
                    if (c.replies?.length) { const found = findComment(c.replies); if (found) return found; }
                }
            }
            const target = findComment(prev);
            prevLiked = target?.liked ?? false;
            prevCount = target?.likeCount ?? 0;
            const nextLiked = !prevLiked;
            return applyLike(prev, nextLiked, prevCount + (nextLiked ? 1 : -1));
        });

        try {
            const res = await fetch(`/ad-posts/${commentPostId}/like`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            const { liked, likeCount } = await res.json();
            setComments((prev) => applyLike(prev, liked, likeCount));
        } catch {
            setComments((prev) => applyLike(prev, prevLiked, prevCount));
        }
    }

    // edit a comment
    async function handleEditComment(postId, content) {
        try {
            const res = await fetch(`/ad-posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) return;
            setComments((prev) => updateCommentContent(prev, postId, content));
        } catch {
            // keep edit form open on failure
        }
    }

    // delete a comment
    async function handleDeleteComment(postId) {
        try {
            const res = await fetch(`/ad-posts/${postId}`, { method: "DELETE" });
            if (!res.ok) return;
            setComments((prev) => removeComment(prev, postId));
            setPost((prev) => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount ?? 1) - 1) } : prev);
        } catch {
            // silent fail
        }
    }

    // reply to a comment
    async function handleAddReply(parentId, { content, images }) {
        try {
            const form = new FormData();
            form.append('content', content);
            images.forEach(img => form.append('images', img));

            const res = await fetch(`/ad-posts/comment/${parentId}`, {
                method: "POST",
                credentials: "include",
                body: form,
            });

            if (!res.ok) return;
            await refreshComments();
        } catch { }
    }


    // ========================== render page
    if (loading) {
        return (
            <>
                <div className="home-header-overlay"><Header /></div>
                <div className="container"><p style={{ padding: "80px 0" }}>Loading…</p></div>
                <Footer />
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <div className="home-header-overlay"><Header /></div>
                <div className="container">
                    <p style={{ padding: "80px 0", color: "rgba(43,43,43,0.55)" }}>
                        {error ?? "Post not found."}
                    </p>
                </div>
                <Footer />
            </>
        );
    }

    const isPostOwner = dbUser && post.userId === dbUser.userId;

    return (
        <>
            <div className="home-header-overlay"><Header /></div>

            <div className="container" style={{ paddingTop: "120px" }}>
                <button className="btn-back btn-12" onClick={() => navigate("/posts")}>
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>All Posts</span>
                </button>

                <div className="section-bg-text">Artsy<br></br>Dublin</div>


                {/* ---- Main two-column layout ---- */}
                <main className="post-detail">

                    {/* Left: event spotlight card */}
                    <ReviewedEventCard
                        event={event}
                        onColorExtracted={setAccentColor}
                    />

                    {/* Right: review content panel */}
                    <PostDetailContent
                        post={post}
                        liked={liked}
                        likeCount={likeCount}
                        accentColor={accentColor}
                        postEditing={postEditing}
                        postEditText={postEditText}
                        postDeleteConfirm={postDeleteConfirm}
                        isPostOwner={isPostOwner}
                        onLikeToggle={() => requireAuth("Log in to like this post", handleLikeToggle)}
                        onEditStart={() => { setPostEditText(post.content); setPostEditing(true); }}
                        onEditChange={setPostEditText}
                        onEditSave={handlePostEdit}
                        onEditCancel={() => setPostEditing(false)}
                        onDeleteRequest={() => setPostDeleteConfirm(true)}
                        onDeleteConfirm={handlePostDelete}
                        onDeleteCancel={() => setPostDeleteConfirm(false)}
                        onOpenLightbox={openLightbox}
                        onScrollToComments={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
                    />
                </main>

                {/*  Comments section  */}
                <div ref={commentsRef} />
                <CommentSection
                    comments={comments}
                    commentCount={post.commentCount}
                    currentUserId={dbUser?.userId}
                    onSubmit={handleCommentSubmit}
                    onAddReply={handleAddReply}
                    onLikeComment={handleLikeComment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onOpenLightbox={openLightbox}
                    isLoggedIn={!!dbUser}
                    onLoginRequired={(msg) => setLoginPrompt(msg)}
                />
            </div>

            <Footer />

            {loginPrompt && (
                <LoginPrompt message={loginPrompt} onClose={() => setLoginPrompt(null)} />
            )}

            {lightbox && (
                <Lightbox
                    images={lightbox.images}
                    startIndex={lightbox.index}
                    onClose={closeLightbox}
                />
            )}
        </>
    );
}

export default PostDetailPage;
