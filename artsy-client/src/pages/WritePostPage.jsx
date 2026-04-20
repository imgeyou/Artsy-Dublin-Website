// Page for writing a new post/review for an event

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar as solidStar, faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ReviewedEventCard from "../components/posts/ReviewedEventCard";

import { useAuth } from "../context/AuthContext";
import "../styles/pages/post-detail.css";
import "../styles/pages/write-post.css";

const MIN_FONT = 18; // px — below this, switch to scroll

function WritePostPage() {
    const { eventId, eventAttendId } = useParams();
    const navigate = useNavigate();
    const { dbUser } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accentColor, setAccentColor] = useState(null);

    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [images, setImages] = useState([]); // { file, preview }[]
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const heroRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    function toMint(color) {
        if (!color) return "#c8f0e0";
        const m = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (!m) return "#c8f0e0";
        const [, r, g, b] = m.map(Number);
        return `rgb(${Math.round(r * 0.2 + 180 * 0.8)},${Math.round(g * 0.2 + 240 * 0.8)},${Math.round(b * 0.2 + 210 * 0.8)})`;
    }

    // Fit font size: shrink until text fits; if min reached, allow scroll
    function fitFontSize() {
        const hero = heroRef.current;
        const ta = textareaRef.current;
        if (!hero || !ta) return;

        ta.style.overflow = "hidden";
        ta.style.fontSize = "100px";

        if (ta.scrollHeight <= hero.clientHeight) {
            // fits at max — keep 100px (or whatever CSS default)
            return;
        }

        let lo = MIN_FONT, hi = 100;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            ta.style.fontSize = mid + "px";
            if (ta.scrollHeight <= hero.clientHeight) lo = mid;
            else hi = mid;
        }
        ta.style.fontSize = lo + "px";

        // If even min font overflows, enable scroll
        if (lo <= MIN_FONT) {
            ta.style.fontSize = MIN_FONT + "px";
            ta.style.overflow = "auto";
        }
    }

    useEffect(() => {
        fitFontSize();
        const ro = new ResizeObserver(fitFontSize);
        if (heroRef.current) ro.observe(heroRef.current);
        return () => ro.disconnect();
    }, [content]);

    function handleInput(e) {
        setContent(e.target.value);
    }

    function handleImagePick(e) {
        const files = Array.from(e.target.files);
        const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        setImages((prev) => [...prev, ...next].slice(0, 6)); // max 6
        e.target.value = "";
    }

    function removeImage(index) {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    }

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/ad-events/event/${eventId}`);
                if (res.ok) setEvent(await res.json());
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [eventId]);

    async function handleSubmit() {
        if (!content.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const form = new FormData();
            form.append("eventId", eventId);
            form.append("content", content.trim());
            if (rating) form.append("rating", rating);
            images.forEach(({ file }) => form.append("images", file));

            const res = await fetch(`/ad-posts/post/${eventAttendId}`, {
                method: "POST",
                credentials: "include",
                body: form,
            });
            if (!res.ok) throw new Error("Failed to submit post");
            const newPost = await res.json();

            if (rating) {
                await fetch(`/ad-posts/${eventAttendId}/rating`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rating }),
                });
            }

            navigate(`/posts/${newPost.postId}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    if (!dbUser) {
        return (
            <>
                <div className="home-header-overlay"><Header /></div>
                <div className="container" style={{ padding: "80px 0" }}>
                    Please log in to write a review.
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="home-header-overlay"><Header /></div>
            <div className="container" style={{ paddingTop: "120px" }}>
                <button className="btn-back btn-12" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>Back</span>
                </button>

                <div className="section-bg-text">Artsy<br />Dublin</div>

                <main className="post-detail">
                    <ReviewedEventCard
                        event={loading ? null : event}
                        onColorExtracted={setAccentColor}
                    />

                    <div className="wp">
                        {/* Hero: textarea + image previews overlay */}
                        <div
                            ref={heroRef}
                            className="wp__hero"
                            style={{ backgroundColor: toMint(accentColor) }}
                            onClick={() => textareaRef.current?.focus()}
                        >
                            <textarea
                                ref={textareaRef}
                                className="wp__textarea"
                                placeholder="YOUR REVIEW HERE…"
                                value={content}
                                onChange={handleInput}
                                maxLength={2000}
                            />

                            {/* Image previews — bottom-right of hero */}
                            {images.length > 0 && (
                                <div className="wp__previews" onClick={(e) => e.stopPropagation()}>
                                    {images.map(({ preview }, i) => (
                                        <div key={i} className="wp__preview-item">
                                            <img src={preview} alt="" className="wp__preview-img" />
                                            <button
                                                type="button"
                                                className="wp__preview-remove"
                                                onClick={() => removeImage(i)}
                                                aria-label="Remove image"
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bottom bar */}
                        <div className="wp__body">
                            <div className="wp__bottom-row">
                                {/* Left: image upload + star rating */}
                                <div className="wp__left-controls">
                                    <button
                                        type="button"
                                        className="wp__img-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Add images"
                                    >
                                        <FontAwesomeIcon icon={faImage} />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleImagePick}
                                    />

                                    <div className="wp__rating-row">
                                        <span className="wp__rating-label">Rating</span>
                                        <div className="wp__stars">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    className="wp__star-btn"
                                                    onMouseEnter={() => setHoverRating(n)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(n === rating ? 0 : n)}
                                                    aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={n <= (hoverRating || rating) ? solidStar : regularStar}
                                                        className={`wp__star ${n <= (hoverRating || rating) ? "wp__star--active" : ""}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: actions */}
                                <div className="wp__actions">
                                    {error && <span className="wp__error">{error}</span>}
                                    <button
                                        className="btn btn-outline btn-12"
                                        onClick={() => navigate(-1)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary btn-12"
                                        onClick={handleSubmit}
                                        disabled={!content.trim() || submitting}
                                    >
                                        {submitting ? "Posting…" : "Post"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}

export default WritePostPage;
