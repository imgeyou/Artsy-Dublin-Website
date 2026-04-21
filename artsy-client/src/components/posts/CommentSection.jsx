// Comment section component: CommentForm + CommentItem + CommentSection
// used in PostDetailPagge

//import react functions
import { useState } from "react";

//import icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeart as solidHeart,
    faXmark,
    faImage,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

//import assets
import defaultAvatar from "../../assets/images/avatar.jpeg";

//import helper
import PostImageRow from "./PostImageRow";
import { formatDate } from "../../utils/postHelpers";
import "../../styles/pages/post-detail.css";

// --------------- CommentForm 
function CommentForm({
    onSubmit,
    placeholder = "Add a comment…",
    autoFocus = false,
    initialText = "",
    onCancel,
    currentUserAvatar,
}) {
    const [text, setText] = useState(initialText);
    const [images, setImages] = useState([]);//post images
    const [previews, setPreviews] = useState([]);//image preview
    const [submitting, setSubmitting] = useState(false);

    // image upload
    function handleFiles(files) {
        const slots = 3 - images.length;
        if (slots <= 0) return;
        const picked = Array.from(files).slice(0, slots);
        setImages((prev) => [...prev, ...picked]);
        setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    }

    function removeImage(i) {
        URL.revokeObjectURL(previews[i]);
        setImages((prev) => prev.filter((_, idx) => idx !== i));
        setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = text.trim();
        if ((!trimmed && images.length === 0) || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit({ content: trimmed, images }); 

            setText("");
            previews.forEach((p) => URL.revokeObjectURL(p));
            setImages([]);
            setPreviews([]);
        } finally {
            setSubmitting(false);
        }
    }

// ----------------- render component
    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            <img src={currentUserAvatar || defaultAvatar} alt="" className="comment-form__avatar" />
            <div className="comment-form__input-wrap">
                <textarea
                    className="comment-form__input"
                    rows={2}
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus={autoFocus}
                />

                {previews.length > 0 && (
                    <div className="comment-form__previews">
                        {previews.map((src, i) => (
                            <div key={i} className="comment-form__preview-item">
                                <img src={src} alt="" className="comment-form__preview-img" />
                                <button
                                    type="button"
                                    className="comment-form__preview-remove"
                                    onClick={() => removeImage(i)}
                                    aria-label="Remove image"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="comment-form__footer">
                    {images.length < 3 && (
                        <label className="comment-form__img-label" aria-label="Add image">
                            <FontAwesomeIcon icon={faImage} />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => {
                                    handleFiles(e.target.files);
                                    e.target.value = "";
                                }}
                            />
                        </label>
                    )}
                    <div className="comment-form__btn-row">
                        {onCancel && (
                            <button
                                type="button"
                                className="btn btn-outline btn--sm btn-12"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary btn--sm btn-12"
                            disabled={(!text.trim() && images.length === 0) || submitting}
                        >
                            {submitting ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

// -------------  CommentItem 

function CommentItem({
    comment,
    currentUserId,
    onAddReply,
    onLikeComment,
    onEdit,
    onDelete,
    onOpenLightbox,
    isLoggedIn,
    onLoginRequired,
}) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isOwner = currentUserId && comment.userId === currentUserId;

    function handleLike() {
        if (!isLoggedIn) { onLoginRequired?.("Log in to like comments"); return; }
        onLikeComment?.(comment.postId);
    }

    function handleReply() {
        if (!isLoggedIn) { onLoginRequired?.("Log in to reply"); return; }
        setShowReplyForm((p) => !p);
    }

    async function handleEditSubmit({ content }) {
        await onEdit?.(comment.postId, content);
        setEditing(false);
    }

    async function handleConfirmDelete() {
        await onDelete?.(comment.postId);
        setConfirmDelete(false);
    }

    return (
        <div className="comment-item">
            <img src={comment.avatarUrl || defaultAvatar} alt="" className="comment-item__avatar" />

            <div className="comment-item__body">
                <div className="comment-item__header">
                    <span className="comment-item__author">{comment.userName ?? "User"}</span>
                    <span className="comment-item__time">{formatDate(comment.createdAt)}</span>
                </div>

                {editing ? (
                    <CommentForm
                        initialText={comment.content}
                        autoFocus
                        onCancel={() => setEditing(false)}
                        onSubmit={handleEditSubmit}
                    />
                ) : (
                    <p className="comment-item__text">{comment.content}</p>
                )}

                {!editing && comment.images?.length > 0 && (
                    <PostImageRow
                        images={comment.images}
                        onOpenLightbox={(i) => onOpenLightbox?.(comment.images, i)}
                        compact
                    />
                )}

                {!editing && (
                    <div className="comment-item__actions">
                        <button
                            className="comment-item__action-btn"
                            onClick={handleLike}
                            aria-label={comment.liked ? "Unlike" : "Like"}
                        >
                            <FontAwesomeIcon icon={comment.liked ? solidHeart : regularHeart} />{" "}
                            {comment.likeCount ?? 0}
                        </button>

                        <button className="comment-item__action-btn" onClick={handleReply}>
                            Reply
                        </button>

                        {isOwner && !confirmDelete && (
                            <>
                                <button
                                    className="comment-item__action-btn"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="comment-item__action-btn comment-item__action-btn--danger"
                                    onClick={() => setConfirmDelete(true)}
                                >
                                    Delete
                                </button>
                            </>
                        )}

                        {isOwner && confirmDelete && (
                            <span className="comment-item__confirm-delete">
                                Delete this comment?{" "}
                                <button
                                    className="comment-item__action-btn comment-item__action-btn--danger"
                                    onClick={handleConfirmDelete}
                                >
                                    Yes, delete
                                </button>
                                <button
                                    className="comment-item__action-btn"
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {showReplyForm && (
                    <div className="comment-reply-form">
                        <CommentForm
                            placeholder={`Reply to ${comment.userName ?? "User"}…`}
                            autoFocus
                            onCancel={() => setShowReplyForm(false)}
                            onSubmit={async (data) => {
                                await onAddReply?.(comment.postId, data);
                                setShowReplyForm(false);
                            }}
                        />
                    </div>
                )}

                {comment.replies?.length > 0 && (
                    <div className="comment-replies">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.postId}
                                comment={reply}
                                currentUserId={currentUserId}
                                onAddReply={onAddReply}
                                onLikeComment={onLikeComment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onOpenLightbox={onOpenLightbox}
                                isLoggedIn={isLoggedIn}
                                onLoginRequired={onLoginRequired}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ------ CommentSection (default export) 

function CommentSection({
    comments,
    commentCount,
    currentUserId,
    currentUserAvatar,
    onSubmit,
    onAddReply,
    onLikeComment,
    onEdit,
    onDelete,
    onOpenLightbox,
    isLoggedIn,
    onLoginRequired,
}) {
    return (
        <section className="post-comments">
            <h2 className="post-comments__title">
                Comments ({commentCount ?? comments.length})
            </h2>

            {isLoggedIn ? (
                <CommentForm onSubmit={onSubmit} currentUserAvatar={currentUserAvatar} />
            ) : (
                <button
                    className="btn btn-outline comment-login-prompt-btn btn-12"
                    onClick={() => onLoginRequired?.("Log in to leave a comment")}
                >
                    Log in to comment…
                </button>
            )}

            <div className="comment-list">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.postId}
                        comment={comment}
                        currentUserId={currentUserId}
                        onAddReply={onAddReply}
                        onLikeComment={onLikeComment}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onOpenLightbox={onOpenLightbox}
                        isLoggedIn={isLoggedIn}
                        onLoginRequired={onLoginRequired}
                    />
                ))}
                {comments.length === 0 && (
                    <p style={{ color: "rgba(43,43,43,0.45)", fontSize: "15px" }}>
                        No comments yet. Be the first to share your thoughts!
                    </p>
                )}
            </div>
        </section>
    );
}

export default CommentSection;
