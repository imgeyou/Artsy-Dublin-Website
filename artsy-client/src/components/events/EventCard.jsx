import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";

function EventCard({ event, variant = "small" }) {
    const [saved, setSaved] = useState(false);

    const formattedDate = event.startDateTime
        ? new Date(event.startDateTime.replace(" ", "T"))
            .toLocaleString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })
            .replace(",", "")
        : "Date to be announced";

    return (
        <div className={`event-card event-card--${variant}`}>
            <Link to={`/events/${event.eventId}`} className="event-card__link">
                <div className="event-card__image-wrap">
                    <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="event-card__image"
                    />

                    <button
                        className={`event-card__save-btn ${saved ? "is-saved" : ""}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setSaved(!saved);
                        }}
                    >
                        <FontAwesomeIcon icon={saved ? solidBookmark : regularBookmark} />
                    </button>
                </div>

                <div className="event-card__content">
                    <p className="event-card__category">
                        {event.description
                            ? event.description.replace(/,\s*/g, " | ")
                            : "Arts & Culture"}
                    </p>

                    <h3 className="event-card__title">
                        {event.title}
                    </h3>

                    <div className="event-card__meta">
                        <p className="event-card__time">{formattedDate}</p>
                        <p className="event-card__venue">{event.venue || "Venue TBA"}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default EventCard;