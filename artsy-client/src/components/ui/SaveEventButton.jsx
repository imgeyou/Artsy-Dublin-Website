import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";

export default function SaveEventButton({
    saved = false,
    onToggle,
    count,
    showCount = false,
    className = "",
}) {
    return (
        <button
            type="button"
            className={`save-event-button ${saved ? "is-saved" : ""} ${className}`}
            onClick={onToggle}
            aria-label={saved ? "Unsave event" : "Save event"}
        >
            <FontAwesomeIcon icon={saved ? solidBookmark : regularBookmark} />
            {showCount && <span>{count ?? 0}</span>}
        </button>
    );
}