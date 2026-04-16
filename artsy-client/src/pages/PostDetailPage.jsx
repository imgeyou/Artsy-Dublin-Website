import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faHeart as solidHeart,
    faStar as solidStar,
    faXmark,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
    faHeart as regularHeart,
    faStar as regularStar,
} from "@fortawesome/free-regular-svg-icons";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import bgl from "../assets/images/bgl.png";

import "../index.css";
import "../styles/pages/post-detail.css";


/** Format a stored date string into a human-readable label */
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr.replace(" ", "T"));
    return date.toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).replace(",", "");
}

/** Full-screen lightbox */
function Lightbox({ images, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [images.length, onClose]);

    const src = images[index];
    const url = src.startsWith("uploads/") ? `/${src}` : src;

    return (
        <div className="lightbox" onClick={onClose}>
            <button className="lightbox__close" onClick={onClose} aria-label="Close">
                <FontAwesomeIcon icon={faXmark} />
            </button>

            {images.length > 1 && (
                <button
                    className="lightbox__nav lightbox__nav--prev"
                    onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); }}
                    aria-label="Previous"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
            )}

            <img
                src={url}
                alt={`image ${index + 1}`}
                className="lightbox__img"
                onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
                <button
                    className="lightbox__nav lightbox__nav--next"
                    onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length); }}
                    aria-label="Next"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            )}

            {images.length > 1 && (
                <div className="lightbox__counter">{index + 1} / {images.length}</div>
            )}
        </div>
    );
}

/** Twitter-style image grid — adapts layout to image count */
function PostImageGrid({ images, compact = false, onOpenLightbox }) {
    if (!images || images.length === 0) return null;

    const count = images.length;
    const gridClass = [
        "post-image-grid",
        `post-image-grid--${Math.min(count, 4)}`,
        compact ? "post-image-grid--compact" : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={gridClass}>
            {images.slice(0, 4).map((src, i) => (
                <div
                    key={i}
                    className="post-image-grid__cell"
                    onClick={() => onOpenLightbox?.(i)}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={src.startsWith("uploads/") ? `/${src}` : src}
                        alt={`post image ${i + 1}`}
                        className="post-image-grid__img"
                    />
                    {i === 3 && count > 4 && (
                        <div className="post-image-grid__more">+{count - 4}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

/** Star rating display (read-only) */
function StarRating({ rating }) {
    if (!rating) return null;
    return (
        <div className="event-rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <FontAwesomeIcon
                    key={n}
                    icon={n <= rating ? solidStar : regularStar}
                    className="event-rating__star"
                />
            ))}
        </div>
    );
}

/** Compact event card for the reviewed event */
function ReviewedEventCard({ event, rating }) {
    if (!event) return <div className="reviewed-event-card reviewed-event-card--skeleton" />;

    const formattedDate = event.startDateTime
        ? formatDate(event.startDateTime)
        : "Date to be announced";

    return (
        <div className="reviewed-event-card">
            <div className="reviewed-event-card__label">Reviewed event</div>

            <Link to={`/events/${event.eventId}`} className="reviewed-event-card__link">
                <div className="reviewed-event-card__poster-wrap">
                    {event.posterUrl ? (
                        <img
                            src={event.posterUrl}
                            alt={event.title}
                            className="reviewed-event-card__poster"
                        />
                    ) : (
                        <div className="reviewed-event-card__poster" />
                    )}
                </div>

                <div className="reviewed-event-card__info">
                    {event.description && (
                        <p className="reviewed-event-card__category">
                            {event.description.split(",")[0].trim()}
                        </p>
                    )}
                    <h3 className="reviewed-event-card__title">{event.title}</h3>
                    <p className="reviewed-event-card__date">{formattedDate}</p>
                    {event.venue && (
                        <p className="reviewed-event-card__venue">{event.venue}</p>
                    )}
                </div>
            </Link>

            <StarRating rating={rating} />
        </div>
    );
}

/** Single comment row (supports one level of replies) */
function CommentItem({ comment, onLike, onOpenLightbox }) {
    const [liked, setLiked] = useState(false);

    function handleLike() {
        setLiked((prev) => !prev);
        onLike?.(comment.postId);
    }

    return (
        <div className="comment-item">
            <div className="comment-item__avatar" />

            <div className="comment-item__body">
                <div className="comment-item__header">
                    <span className="comment-item__author">
                        {comment.userName ?? "User"}
                    </span>
                    <span className="comment-item__time">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>

                <p className="comment-item__text">{comment.content}</p>

                {comment.images?.length > 0 && (
                    <PostImageGrid
                        images={comment.images}
                        compact
                        onOpenLightbox={(i) => onOpenLightbox?.(comment.images, i)}
                    />
                )}

                <div className="comment-item__actions">
                    <button
                        className="comment-item__action-btn"
                        onClick={handleLike}
                        aria-label={liked ? "Unlike" : "Like"}
                    >
                        <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />{" "}
                        {(comment.likeCount ?? 0) + (liked ? 1 : 0)}
                    </button>
                </div>

                {/* Nested replies */}
                {comment.replies?.length > 0 && (
                    <div className="comment-replies">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.postId} comment={reply} onLike={onLike} onOpenLightbox={onOpenLightbox} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

function PostDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Lightbox: { images: string[], index: number } | null
    const [lightbox, setLightbox] = useState(null);
    function openLightbox(images, index) { setLightbox({ images, index }); }
    function closeLightbox() { setLightbox(null); }

    // Fetch post data
    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${id}`);
                if (!res.ok) throw new Error("Failed to fetch post");
                const data = await res.json();
                setPost(data);
                setLikeCount(data.likeCount ?? 0);
                setComments(data.comments ?? []);

                // Fetch event details with the eventId from the post
                if (data.eventId) {
                    const eventRes = await fetch(`/api/events/event/${data.eventId}`);
                    if (eventRes.ok) {
                        const eventData = await eventRes.json();
                        setEvent(eventData);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [id]);

    async function handleLikeToggle() {
        try {
            const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
            if (!res.ok) return;
            const { liked: nowLiked } = await res.json();
            setLiked(nowLiked);
            setLikeCount((prev) => (nowLiked ? prev + 1 : Math.max(0, prev - 1)));
        } catch {
            // silent fail — optimistic UI not used here
        }
    }

    async function handleCommentSubmit(e) {
        e.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/comment/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });
            if (!res.ok) throw new Error("Failed to post comment");

            // optimistically append comment to UI
            const { postId } = await res.json();
            const newComment = {
                postId,
                postParentId: Number(id),
                content: trimmed,
                createdAt: new Date().toISOString(),
                userName: "You",
                likeCount: 0,
                commentCount: 0,
                images: [],
                replies: [],
            };
            setComments((prev) => [...prev, newComment]);
            setCommentText("");
            setPost((prev) => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) + 1 } : prev);
        } catch {
            // keep text in field on failure
        } finally {
            setSubmitting(false);
        }
    }

    // ----- Render states -----
    if (loading) {
        return (
            <>
                <Header />
                <div className="container">
                    <p style={{ padding: "80px 0" }}>Loading…</p>
                </div>
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

    return (
        <>
            <Header />

            <div className="container">
                {/* Back navigation */}
                <button className="btn-back" onClick={() => navigate("/posts")}>
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>All Posts</span>
                </button>

                {/* Decorative line */}
                <div className="bgl">
                    <img src={bgl} alt="" />
                </div>

                {/* ---- Main two-column layout ---- */}
                <main className="post-detail">

                    {/* Left: reviewed event card */}
                    <ReviewedEventCard event={event} rating={post.rating} />

                    {/* Right: post content */}
                    <div className="post-detail__content">

                        {/* Author row */}
                        <div className="post-author">
                            <div className="post-author_info">
                                <div className="post-author_avatar" />
                                <span className="post-author_name">
                                    {post.username ?? "User"}
                                </span>
                            </div>
                            <span className="post-detail__date">
                                {formatDate(post.createdAt)}
                            </span>
                        </div>

                        {/* Post text */}
                        <p className="post-detail__description">{post.content}</p>

                        {/* Twitter-style image grid — falls back to event poster when no user images */}
                        {(() => {
                            const displayImages = post.images?.length
                                ? post.images
                                : event?.posterUrl
                                ? [event.posterUrl]
                                : [];
                            return (
                                <PostImageGrid
                                    images={displayImages}
                                    onOpenLightbox={(i) => openLightbox(displayImages, i)}
                                />
                            );
                        })()}

                        {/* Like button */}
                        <div className="post-actions">
                            <button
                                className={`btn ${liked ? "btn-primary" : "btn-outline"}`}
                                onClick={handleLikeToggle}
                            >
                                <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />{" "}
                                {likeCount} {liked ? "Liked" : "Like"}
                            </button>
                        </div>
                    </div>
                </main>

                {/* ---- Comments section ---- */}
                <section className="post-comments">
                    <h2 className="post-comments__title">
                        Comments ({post.commentCount ?? comments.length})
                    </h2>

                    {/* New comment form */}
                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <div className="comment-form__avatar" />
                        <div className="comment-form__input-wrap">
                            <textarea
                                className="comment-form__input"
                                rows={3}
                                placeholder="Add a comment…"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary comment-form__submit"
                                disabled={!commentText.trim() || submitting}
                            >
                                {submitting ? "Posting…" : "Post"}
                            </button>
                        </div>
                    </form>

                    {/* Comment list */}
                    <div className="comment-list">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.postId}
                                comment={comment}
                                onOpenLightbox={openLightbox}
                            />
                        ))}
                        {comments.length === 0 && (
                            <p style={{ color: "rgba(43,43,43,0.45)", fontSize: "15px" }}>
                                No comments yet. Be the first to share your thoughts!
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <Footer />

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
