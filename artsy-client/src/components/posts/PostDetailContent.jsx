// Right-column post detail panel, used in PostDetailPage

import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart, faPen, faTrash, faChevronRight, faChevronLeft, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

import StarRating from "./StarRating";
import { formatDate, resolveImageUrl } from "../../utils/postHelpers";
import defaultAvatar from "../../assets/images/avatar.jpeg";

function fitTextToHero(heroEl, textEl) {
    if (!heroEl || !textEl) return;
    const cs = getComputedStyle(heroEl);
    const availH = heroEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const availW = heroEl.clientWidth  - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    textEl.style.fontSize = "10px";
    let lo = 10, hi = 120;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        textEl.style.fontSize = mid + "px";
        if (textEl.scrollHeight <= availH && textEl.scrollWidth <= availW) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    textEl.style.fontSize = lo + "px";
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l * 100];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        default: h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = (t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)].map(v => Math.round(v * 255));
}

// Returns a soft pastel whose hue is 150° away (split-complementary) from the given rgb() string
function splitComplementBg(color) {
    const fallback = "#dceef5";
    if (!color) return fallback;
    const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return fallback;
    const [, r, g, b] = m.map(Number);
    let [h, s, l] = rgbToHsl(r, g, b);
    h = (h + 150) % 360;           // split-complementary rotation
    s = Math.min(s * 0.8, 70);     // keep most saturation, cap to avoid overwhelming
    l = Math.max(78, Math.min(90, 100 - l * 0.18)); // light pastel range
    const [nr, ng, nb] = hslToRgb(h, s, l);
    return `rgb(${nr},${ng},${nb})`;
}

// Loads an image off-screen, extracts dominant colour, portrait flag, and bottom-strip brightness
function extractImageMeta(src, onResult) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const isPortrait = img.naturalWidth / img.naturalHeight < 0.75;
        let bg = null;
        let darkBottom = true; // default: assume dark → white dots

        try {
            const canvas = document.createElement("canvas");
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            // Full image → dominant colour (for portrait bg)
            ctx.drawImage(img, 0, 0, 16, 16);
            const full = ctx.getImageData(0, 0, 16, 16).data;
            let r = 0, g = 0, b = 0;
            const count = full.length / 4;
            for (let i = 0; i < full.length; i += 4) {
                r += full[i]; g += full[i + 1]; b += full[i + 2];
            }
            if (isPortrait) {
                bg = `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
            }

            // Bottom 20% strip → brightness for dot colour
            const stripH = Math.max(1, Math.round(img.naturalHeight * 0.2));
            canvas.width = 16;
            canvas.height = 4;
            ctx.drawImage(img, 0, img.naturalHeight - stripH, img.naturalWidth, stripH, 0, 0, 16, 4);
            const strip = ctx.getImageData(0, 0, 16, 4).data;
            let lum = 0;
            const sCount = strip.length / 4;
            for (let i = 0; i < strip.length; i += 4) {
                // perceived luminance
                lum += 0.299 * strip[i] + 0.587 * strip[i + 1] + 0.114 * strip[i + 2];
            }
            darkBottom = (lum / sCount) < 128;
        } catch (_) {}

        onResult({ portrait: isPortrait, bg, darkBottom });
    };
    img.src = src;
}

function PostDetailContent({
    post,
    liked,
    likeCount,
    accentColor,
    postEditing,
    postEditText,
    postDeleteConfirm,
    isPostOwner,
    onLikeToggle,
    onEditStart,
    onEditChange,
    onEditSave,
    onEditCancel,
    onDeleteRequest,
    onDeleteConfirm,
    onDeleteCancel,
    onOpenLightbox,
    onScrollToComments,
}) {
    const heroRef = useRef(null);
    const textSlideRef = useRef(null);
    const textRef = useRef(null);
    const [showImages, setShowImages] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageMeta, setImageMeta] = useState({}); // { [index]: { portrait, bg } }
    const loadedRef = useRef(new Set());

    const displayImages = post.images?.length ? post.images : [];
    const hasImages = displayImages.length > 0;

    // Reset carousel when post changes
    useEffect(() => {
        setCurrentImageIndex(0);
        setImageMeta({});
        loadedRef.current = new Set();
    }, [post._id]);

    // Preload meta for all images
    useEffect(() => {
        displayImages.forEach((src, i) => {
            if (loadedRef.current.has(i)) return;
            loadedRef.current.add(i);
            extractImageMeta(resolveImageUrl(src), (meta) => {
                setImageMeta(prev => ({ ...prev, [i]: meta }));
            });
        });
    }, [displayImages.length]);

    useEffect(() => {
        if (showImages) return;
        fitTextToHero(textSlideRef.current, textRef.current);
        const ro = new ResizeObserver(() => {
            if (!showImages) fitTextToHero(textSlideRef.current, textRef.current);
        });
        if (heroRef.current) ro.observe(heroRef.current);
        return () => ro.disconnect();
    }, [post.content, showImages]);

    const panelBg = splitComplementBg(accentColor);

    const meta = imageMeta[currentImageIndex];
    const isPortrait = meta?.portrait ?? false;
    const frameBg = isPortrait ? (meta?.bg ?? "#1a1a1a") : "transparent";
    const darkBottom = meta?.darkBottom ?? true;
    const dotColor = darkBottom ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)";
    const dotColorActive = darkBottom ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)";

    return (
        <div className="pdc">

            {/* Hero: carousel track — text slide + image slide */}
            <div className="pdc__hero" ref={heroRef} style={{ backgroundColor: panelBg }}>

                <div className={`pdc__track ${showImages ? "pdc__track--images" : ""}`}>
                    {/* Slide 1: headline text */}
                    <div className="pdc__slide pdc__slide--text" ref={textSlideRef}>
                        <p className="pdc__headline" ref={textRef}>{post.content}</p>
                    </div>

                    {/* Slide 2: dot-controlled image carousel */}
                    <div className="pdc__slide pdc__slide--images">
                        {hasImages && (
                            <>
                                <div
                                    className="pdc__carousel-frame"
                                    style={{ backgroundColor: frameBg }}
                                >
                                    <img
                                        key={currentImageIndex}
                                        src={resolveImageUrl(displayImages[currentImageIndex])}
                                        alt={`Post image ${currentImageIndex + 1}`}
                                        className={`pdc__carousel-img${isPortrait ? " pdc__carousel-img--contain" : ""}`}
                                        onClick={() => onOpenLightbox(displayImages, currentImageIndex)}
                                    />
                                </div>

                                {displayImages.length > 1 && (
                                    <div
                                        className="pdc__dots"
                                        style={{
                                            "--dot-color": dotColor,
                                            "--dot-color-active": dotColorActive,
                                        }}
                                    >
                                        {displayImages.map((_, i) => (
                                            <button
                                                key={i}
                                                className={`pdc__dot${i === currentImageIndex ? " pdc__dot--active" : ""}`}
                                                onClick={() => setCurrentImageIndex(i)}
                                                aria-label={`Image ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right arrow — show images */}
                {hasImages && !showImages && (
                    <button
                        className="pdc__arrow pdc__arrow--right"
                        onClick={() => setShowImages(true)}
                        aria-label="Show images"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                )}

                {/* Left arrow — back to text */}
                {showImages && (
                    <button
                        className="pdc__arrow pdc__arrow--left"
                        onClick={() => setShowImages(false)}
                        aria-label="Back to review"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                )}
            </div>

            {/* Body bar */}
            <div className={`pdc__body ${showImages ? "pdc__body--dim" : ""}`}>
                <div className="pdc__body-top">
                    <div className="post-author">
                        <img
                            src={post.avatarUrl || defaultAvatar}
                            alt={post.username}
                            className="post-author_avatar"
                        />
                        <span className="post-author_name">{post.username ?? "User"}</span>
                        <span className="post-detail__date">{formatDate(post.createdAt)}</span>
                    </div>

                    <div className="post-actions">
                        <button className="btn btn-outline pdc__comment-btn btn-12" onClick={onScrollToComments}>
                            <span><FontAwesomeIcon icon={faCommentDots} /> Comments</span>
                        </button>
                        <button
                            className={`btn btn-12 ${liked ? "btn-primary" : "btn-outline"}`}
                            onClick={onLikeToggle}
                        >
                            <span><FontAwesomeIcon icon={liked ? solidHeart : regularHeart} />{" "}
                            {likeCount} {liked ? "Liked" : "Like"}</span>
                        </button>

                        {isPostOwner && !postEditing && !postDeleteConfirm && (
                            <>
                                <button className="btn btn-outline btn-12" onClick={onEditStart}>
                                    <span><FontAwesomeIcon icon={faPen} /> Edit</span>
                                </button>
                                <button className="btn btn-outline btn--danger btn-12" onClick={onDeleteRequest}>
                                    <span><FontAwesomeIcon icon={faTrash} /> Delete</span>
                                </button>
                            </>
                        )}

                        {isPostOwner && postDeleteConfirm && (
                            <span className="post-delete-confirm">
                                Delete this post?{" "}
                                <button className="btn btn-outline btn--danger btn--sm btn-12" onClick={onDeleteConfirm}>
                                    <span>Yes, delete</span>
                                </button>
                                <button className="btn btn-outline btn--sm btn-12" onClick={onDeleteCancel}>
                                    <span>Cancel</span>
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {postEditing && (
                    <div className="post-edit-form">
                        <textarea
                            className="comment-form__input"
                            rows={4}
                            value={postEditText}
                            onChange={(e) => onEditChange(e.target.value)}
                            autoFocus
                        />
                        <div className="comment-form__btn-row" style={{ marginTop: "8px" }}>
                            <button className="btn btn-outline btn--sm btn-12" onClick={onEditCancel}><span>Cancel</span></button>
                            <button
                                className="btn btn-primary btn--sm btn-12"
                                onClick={onEditSave}
                                disabled={!postEditText.trim()}
                            >
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className="pdc__body-bottom">
                    <StarRating rating={post.rating} />
                </div>
            </div>
        </div>
    );
}

export default PostDetailContent;
