import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../context/AuthContext";

function EventCard({ event, variant = "small" }) {
    const { dbUser } = useAuth();
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

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
                        disabled={saving}
                        onClick={async (e) => {
                            e.preventDefault();
                            if (!dbUser?.userName) { navigate("/login"); return; }
                            setSaving(true);
                            try {
                                const res = await fetch(`/ad-posts/${event.eventId}/save`, {
                                    method: "POST",
                                    credentials: "include",
                                });
                                if (res.ok) {
                                    setSaved((prev) => !prev);
                                } else {
                                    const text = await res.text();
                                    console.error("Save failed:", res.status, text);
                                }
                            } catch (err) {
                                console.error("Save error:", err);
                            } finally {
                                setSaving(false);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={saved ? solidBookmark : regularBookmark} />
                    </button>
                </div>

                <div className="event-card__content">
                    <p className="event-card__category">
                        {event.description
                            ? event.description.slice(0, 30)
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