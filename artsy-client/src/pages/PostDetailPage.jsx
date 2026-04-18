//this is the detail page for single post

//import react functions
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

//import backend api
//const API_BASE_URL = import.meta.env.VITE_API_URL;

//import icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHeart as solidHeart, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

//import components
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Lightbox from "../components/posts/Lightbox";
import PostImageRow from "../components/posts/PostImageRow";
import StarRating from "../components/posts/StarRating";
import ReviewedEventCard from "../components/posts/ReviewedEventCard";
import CommentSection from "../components/posts/CommentSection";
import LoginPrompt from "../components/common/LoginPrompt";

//import helpers
import { formatDate } from "../utils/postHelpers";
import { useAuth } from "../context/AuthContext";

//import assets + style
import bgl from "../assets/images/bgl.png";
import defaultAvatar from "../assets/images/avatar.jpeg";
import "../index.css";
import "../styles/pages/post-detail.css";


// ==================== functions handling
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

    const [lightbox, setLightbox] = useState(null); // { images, index }
    const [loginPrompt, setLoginPrompt] = useState(null); // message string or null

    const [postEditing, setPostEditing] = useState(false);
    const [postEditText, setPostEditText] = useState("");
    const [postDeleteConfirm, setPostDeleteConfirm] = useState(false);

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

    // ------- interaction handlers
    //open image in full screen
    function openLightbox(images, index) {
        setLightbox({ images, index });
    }
    function closeLightbox() { setLightbox(null); }

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

    // edit/delete the main post
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

    async function handlePostDelete() {
        try {
            const res = await fetch(`/ad-posts/${id}`, { method: "DELETE" });
            if (!res.ok) return;
            navigate("/posts");
        } catch {
            setPostDeleteConfirm(false);
        }
    }

    // edit/delete a comment or reply
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

    async function handleCommentSubmit({ content, images }) {
        const form = new FormData();
        form.append('content', content);
        images.forEach(img => form.append('images', img)); // raw File objects, not base64

        const res = await fetch(`/ad-posts/comment/${id}`, {
            method: 'POST',
            credentials: 'include',
            body: form
        });
    }
    async function handleAddReply(parentId, { content, images }) {
        try {
            const res = await fetch(`/ad-posts/${id}/comments/${parentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, images }),
                credentials: "include",
            });

            if (!res.ok) return;

            const newReply = await res.json();

            function insertReply(comments) {
                return comments.map((c) => {
                    if (c.postId === parentId) {
                        return { ...c, replies: [...(c.replies || []), newReply] };
                    }
                    if (c.replies?.length) {
                        return { ...c, replies: insertReply(c.replies) };
                    }
                    return c;
                });
            }

            setComments((prev) => insertReply(prev));
        } catch { }
    }


    // ========================== render page
    if (loading) {
        return (
            <>
                <Header />
                <div className="container"><p style={{ padding: "80px 0" }}>Loading…</p></div>
                <Footer />
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <Header />
                <div className="container">
                    <p style={{ padding: "80px 0", color: "rgba(43,43,43,0.55)" }}>
                        {error ?? "Post not found."}
                    </p>
                </div>
                <Footer />
            </>
        );
    }

    const displayImages = post.images?.length ? post.images : [];
    const isPostOwner = dbUser && post.userId === dbUser.userId;

    return (
        <>
            <Header />

            <div className="container">
                <button className="btn-back" onClick={() => navigate("/posts")}>
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>All Posts</span>
                </button>

                <div className="section-bg-text">Artsy<br></br>Dublin</div>


                {/* ---- Main two-column layout ---- */}
                <main className="post-detail">

                    {/* Left: event card */}
                    <ReviewedEventCard event={event} />

                    {/* Right: review content */}
                    <div className="post-detail__content">

                        <div className="post-author">
                            <img
                                src={post.avatarUrl || defaultAvatar}
                                alt={post.username}
                                className="post-author_avatar"
                            />
                            <span className="post-author_name">{post.username ?? "User"}</span>
                        </div>

                        <span className="post-detail__date">{formatDate(post.createdAt)}</span>

                        <StarRating rating={post.rating} />

                        {postEditing ? (
                            <div className="post-edit-form">
                                <textarea
                                    className="comment-form__input"
                                    rows={4}
                                    value={postEditText}
                                    onChange={(e) => setPostEditText(e.target.value)}
                                    autoFocus
                                />
                                <div className="comment-form__btn-row" style={{ marginTop: "8px" }}>
                                    <button
                                        className="btn btn-outline btn--sm"
                                        onClick={() => setPostEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary btn--sm"
                                        onClick={handlePostEdit}
                                        disabled={!postEditText.trim()}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="post-detail__description">{post.content}</p>
                        )}

                        <PostImageRow
                            images={displayImages}
                            onOpenLightbox={(i) => openLightbox(displayImages, i)}
                        />

                        <div className="post-actions">
                            <button
                                className={`btn ${liked ? "btn-primary" : "btn-outline"}`}
                                onClick={() => requireAuth("Log in to like this post", handleLikeToggle)}
                            >
                                <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />{" "}
                                {likeCount} {liked ? "Liked" : "Like"}
                            </button>

                            {isPostOwner && !postEditing && !postDeleteConfirm && (
                                <>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => { setPostEditText(post.content); setPostEditing(true); }}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </button>
                                    <button
                                        className="btn btn-outline btn--danger"
                                        onClick={() => setPostDeleteConfirm(true)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                    </button>
                                </>
                            )}

                            {isPostOwner && postDeleteConfirm && (
                                <span className="post-delete-confirm">
                                    Delete this post?{" "}
                                    <button className="btn btn-outline btn--danger btn--sm" onClick={handlePostDelete}>
                                        Yes, delete
                                    </button>
                                    <button className="btn btn-outline btn--sm" onClick={() => setPostDeleteConfirm(false)}>
                                        Cancel
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                </main>

                {/*  Comments section  */}
                <CommentSection
                    comments={comments}
                    commentCount={post.commentCount}
                    currentUserId={dbUser?.userId}
                    onSubmit={handleCommentSubmit}
                    onAddReply={handleAddReply}
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

// ---- helpers to update nested comment state
function updateCommentContent(comments, postId, content) {
    return comments.map((c) => {
        if (c.postId === postId) return { ...c, content };
        if (c.replies?.length) return { ...c, replies: updateCommentContent(c.replies, postId, content) };
        return c;
    });
}

function removeComment(comments, postId) {
    return comments
        .filter((c) => c.postId !== postId)
        .map((c) => c.replies?.length ? { ...c, replies: removeComment(c.replies, postId) } : c);
}

// handleCommentSubmit and handleAddReply defined at module level to avoid re-creation
// (they need setComments/setPost/id/API_BASE_URL — kept inside component above)

export default PostDetailPage;
