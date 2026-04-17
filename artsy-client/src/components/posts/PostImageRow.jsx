// image row component, used in postDetailPage for showing user uploaded pics

import { resolveImageUrl } from "../../utils/postHelpers";

function PostImageRow({ images, onOpenLightbox }) {
    if (!images || images.length === 0) return null;

    return (
        <div className={`post-image-row ${images.length === 1 ? "post-image-row--single" : ""}`}>
            {images.map((src, i) => (
                <div key={i} className="post-image-row__item" onClick={() => onOpenLightbox?.(i)}>
                    <img
                        src={resolveImageUrl(src)}
                        alt={`user uploaded post image ${i + 1}`}
                        className="post-image-row__img"
                    />
                </div>
            ))}
        </div>
    );
}

export default PostImageRow;
