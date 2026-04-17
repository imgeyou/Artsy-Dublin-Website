import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { resolveImageUrl } from "../../utils/postHelpers";

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
                src={resolveImageUrl(images[index])}
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

export default Lightbox;
