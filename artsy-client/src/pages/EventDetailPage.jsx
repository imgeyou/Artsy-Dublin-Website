import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import mockEvents from "../mock/events";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import bgl from '../assets/images/bgl.png'
import hostAvatar from '../assets/images/avatar.jpeg'
import EventCard from "../components/events/EventCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCalendarDays,
    faLocationDot,
    faBookmark as solidBookmark,
} from "@fortawesome/free-solid-svg-icons";

import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";

import '../index.css'
import '../styles/pages/event-detail.css'



function EventDetailPage() {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [event, setEvent] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    // const API_BASE_URL =
    //     import.meta.env.VITE_API_URL || "http://localhost:3005";

    useEffect(() => {
        async function loadEvent() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/ad-events/event/${id}`);
                console.log("detail response status:", res.status);

                if (!res.ok) {
                    throw new Error("Failed to fetch event");
                }

                const data = await res.json();
                console.log("detail fetched data:", data);

                const normalizedEvent = {
                    eventId: data.eventId ?? Number(id),
                    title: data.title ?? "",
                    url: data.url ?? "",
                    description: data.description ?? "",
                    venue: data.venue ?? "",
                    startDateTime: data.startDateTime ?? "",
                    posterUrl: data.posterUrl ?? data.posterURL ?? "",
                    eventTypeId: data.eventTypeId ?? "",
                    eventTypeName: data.eventTypeName ?? "",
                    genres: data.genres ?? [],
                    eventRepeats: data.eventRepeats ?? [],
                    attendance: data.attendance ?? null,
                };

                setEvent(normalizedEvent);

                const related = mockEvents
                    .filter((item) => item.eventId !== normalizedEvent.eventId)
                    .filter((item) => item.eventTypeId === normalizedEvent.eventTypeId)
                    .slice(0, 6);

                setRelatedEvents(related);
            } catch (err) {
                console.error("Error loading event:", err);

                const foundEvent = mockEvents.find(
                    (item) => item.eventId === Number(id)
                );

                if (foundEvent) {
                    setEvent(foundEvent);

                    const related = mockEvents
                        .filter((item) => item.eventId !== foundEvent.eventId)
                        .filter((item) => item.eventTypeId === foundEvent.eventTypeId)
                        .slice(0, 6);

                    setRelatedEvents(related);
                    setError(null);
                } else {
                    setError("Could not load event details.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadEvent();
    }, [id, "TEST"]);

    if (loading) {
        return <p className="status-message">Loading event...</p>;
    }

    if (error) {
        return <p className="status-message error">{error}</p>;
    }

    if (!event) {
        return <p className="status-message">Event not found.</p>;
    }

    function getEventTags(event) {
        if (event.eventTypeId === "tmdbFilm") return ["Film"];

        return event.description
            ? event.description.split(",").map(tag => tag.trim())
            : [];
    }


    const formattedDate = event.startDateTime
        ? new Date(event.startDateTime)
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
        <>
            <Header />

            <div className="container">
                <button
                    className="btn-back"
                    onClick={() => navigate(-1)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>All EVENTS</span>
                </button>
                <div className="bgl">
                    <img src={bgl} alt="" />
                </div>

                <main className="event-hero">
                    <aside className="event-hero__rail">
                        <span className="event-hero__rail-text">WELCOME TO EVENT</span>
                    </aside>

                    <section className="event-hero__banner">
                        <img
                            src={event.posterUrl || "https://via.placeholder.com/1200x700?text=No+Image"}
                            alt={event.title}
                            className="event-hero__image"
                        />

                        <div className="event-hero__overlay"></div>

                        <div className="event-hero__content">
                            <div className="event-hero__topline">
                                {event.eventTypeName && (
                                    <p className="event-hero__type">{event.eventTypeName}</p>
                                )}

                                {event.genres && event.genres.length > 0 && (
                                    <div className="event-hero__genres">
                                        {event.genres.map((genre) => (
                                            <span key={genre} className="event-hero__genre-tag">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <h1 className="event-hero__title">{event.title}</h1>

                            <p className="event-hero__date">
                                {formattedDate}
                            </p>

                            <div className="event-hero__buttons">
                                {event.url ? (
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        Get Tickets
                                    </a>
                                ) : (
                                    <button className="btn btn-primary" disabled>
                                        Tickets Unavailable
                                    </button>
                                )}

                                <button
                                    className={`btn-secondary btn-save-detail ${saved ? "is-saved" : ""}`}
                                    onClick={() => setSaved(!saved)}
                                >
                                    <FontAwesomeIcon icon={saved ? solidBookmark : regularBookmark} />
                                </button>
                            </div>
                        </div>

                        <div className="event-hero__info-card">
                            <div className="event-hero__info-item">
                                <span className="event-hero__info-label">Venue</span>
                                <p>{event.venue || "Venue TBA"}</p>
                            </div>

                            <div className="event-hero__info-item">
                                <span className="event-hero__info-label">Category</span>
                                <p>{event.eventTypeName || "Event"}</p>
                            </div>

                            <div className="event-hero__info-item">
                                <span className="event-hero__info-label">Date</span>
                                <p>{formattedDate}</p>
                            </div>
                        </div>
                    </section>
                </main>

                <section className="event-body">
                    <div className="event-body__main">
                        <p className="event-body__eyebrow">WELCOME</p>
                        <h2 className="event-body__title">About this event</h2>
                        <p className="event-body__description">
                            {event.description || "More event details coming soon."}
                        </p>

                        {/* <div className="event-host">
                            <div className="event-host__avatar">
                                <img src={hostAvatar} alt="host" />
                                <span className="event-host__name">Hosted by Brian</span>
                            </div>
                            <button className="btn btn-follow">Follow</button>
                        </div> */}
                    </div>

                    <aside className="event-body__side">
                        <div className="event-body__meta-card">
                            <h3>Event Details</h3>

                            <div className="event-detail_meta-item">
                                <FontAwesomeIcon icon={faCalendarDays} className="event-detail_icon" />
                                <p className="event-detail_time">{formattedDate}</p>
                            </div>

                            <div className="event-detail_meta-item">
                                <FontAwesomeIcon icon={faLocationDot} className="event-detail_icon" />
                                <p className="event-detail_venue">{event.venue || "Venue TBA"}</p>
                            </div>
                        </div>

                        {event.venue && event.venue !== "Various Venues" && (
                            <div className="event-body__map-card">
                                <h3>Location</h3>
                                <iframe
                                    title="Event location map"
                                    width="100%"
                                    height="260"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        `${event.venue}, Dublin`
                                    )}&output=embed`}
                                />
                            </div>
                        )}
                    </aside>
                </section>
                <section className="related-events">
                    <div className="related-events__header">
                        <h2 className="related-events__title">Related Events</h2>
                        <p className="related-events__subtitle">
                            You might also like these events
                        </p>
                    </div>

                    <div className="related-events__grid">
                        {relatedEvents.map((item) => (
                            <EventCard key={item.eventId} event={item} />
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}

export default EventDetailPage;