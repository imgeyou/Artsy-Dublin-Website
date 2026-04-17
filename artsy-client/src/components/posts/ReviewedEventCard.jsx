// event card component, used in PostDetailPage

//import react functions
import { Link } from "react-router-dom";

//import icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faPen, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../utils/postHelpers";

function ReviewedEventCard({ event }) {
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
                        <img src={event.posterUrl} alt={event.title} className="reviewed-event-card__poster" />
                    ) : (
                        <div className="reviewed-event-card__poster-placeholder" />
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
                    {event.venue && <p className="reviewed-event-card__venue">{event.venue}</p>}
                </div>
            </Link>

            <div className="reviewed-event-card__stats">
                <div className="event-stat">
                    <FontAwesomeIcon icon={faBookmark} className="event-stat__icon" />
                    <span>{event.saveCount ?? 0}</span>
                    <span className="event-stat__label">saved</span>
                </div>
                <div className="event-stat">
                    <FontAwesomeIcon icon={faPen} className="event-stat__icon" />
                    <span>{event.reviewCount ?? 0}</span>
                    <span className="event-stat__label">reviews</span>
                </div>
                <div className="event-stat">
                    <FontAwesomeIcon icon={faUserCheck} className="event-stat__icon" />
                    <span>{event.attendCount ?? 0}</span>
                    <span className="event-stat__label">attended</span>
                </div>
            </div>
        </div>
    );
}

export default ReviewedEventCard;
