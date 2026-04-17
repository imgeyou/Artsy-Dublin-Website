import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

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

export default StarRating;
