import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import mockEvents from "../mock/events";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import bgl from '../assets/images/bgl.png'
import hostAvatar from '../assets/images/avatar.jpeg'
import EventCard from "../components/events/EventCard";
import SaveEventButton from '../components/ui/SaveEventButton'

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
import { useAuth } from "../context/AuthContext";
function getEventTypeIdFromName(eventTypeName) {
    if (eventTypeName === "Music") return "KZFzniwnSyZfZ7v7nJ";
    if (eventTypeName === "Arts & Theatre") return "KZFzniwnSyZfZ7v7na";
    if (eventTypeName === "Film" || eventTypeName === "Film Showing") return "tmdbFilm";
    return "";
}

function getFallbackTags(item) {
    if (!item?.description) return [];

    if (item.eventTypeId === "tmdbFilm") return ["Film"];

    return item.description
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function getRelatedEvents(currentEvent, allEvents) {
    if (!currentEvent) return [];

    const currentGenres =
        currentEvent.genres && currentEvent.genres.length > 0
            ? currentEvent.genres
            : getFallbackTags(currentEvent);

    const currentTypeId =
        currentEvent.eventTypeId ||
        getEventTypeIdFromName(currentEvent.eventTypeName);

    return allEvents
        .filter((item) => item.eventId !== currentEvent.eventId)
        .filter((item) => {
            if (!currentTypeId) return true;
            return item.eventTypeId === currentTypeId;
        })
        .map((item) => {
            const itemGenres =
                item.genres && item.genres.length > 0
                    ? item.genres
                    : getFallbackTags(item);

            const sharedGenres = itemGenres.filter((genre) =>
                currentGenres.includes(genre)
            );

            let score = 0;
            score += 2;
            score += sharedGenres.length * 3;
            if (item.startDateTime) score += 1;

            return { ...item, _score: score };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, 6);
}

function EventDetailPage() {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [event, setEvent] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { dbUser } = useAuth();
    console.log("dbUser:", dbUser);
    // const API_BASE_URL =
    //     import.meta.env.VITE_API_URL || "http://localhost:3005";
    function getBreadcrumbText(event) {
        const parts = ["All Events"];

        if (event?.eventTypeName) {
            parts.push(event.eventTypeName);
        }

        if (event?.genres && event.genres.length > 0) {
            parts.push(event.genres[0]);
        }

        return parts.join(" / ");
    }
    async function handleToggleSave() {
        if (!dbUser?.userId) {
            navigate("/login");
            return;
        }

        if (!event?.eventId) return;

        try {
            const method = saved ? "DELETE" : "POST";

            const res = await fetch(`/ad-posts/${event.eventId}/save`, {
                method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            console.log("save status:", res.status);
            console.log("save response:", data);

            if (!res.ok) {
                throw new Error(data?.error || "Save toggle failed");
            }

            setSaved(!!data.saved);

            // 再抓一次最新 event detail
            const eventRes = await fetch(`/ad-events/event/${event.eventId}`);
            const eventData = await eventRes.json();

            setEvent((prev) => ({
                ...prev,
                saveCount: eventData.saveCount ?? 0,
            }));
        } catch (err) {
            console.error("Save event failed:", err);
        }
    }
    useEffect(() => {
        async function loadEvent() {
            try {
                setLoading(true);
                setError(null);
                const eventsRes = await fetch("/ad-events");
                const allLiveEvents = await eventsRes.json();
                const normalizedAllEvents = allLiveEvents.map((event, index) => ({
                    eventId: event.eventId ?? index,
                    title: event.title ?? "",
                    url: event.url ?? "",
                    description: event.description ?? "",
                    venue: event.venue ?? "",
                    startDateTime: event.startDateTime ?? "",
                    posterUrl: event.posterUrl ?? event.posterURL ?? "",
                    eventTypeId: event.eventTypeId ?? "",
                    eventTypeName:
                        event.eventTypeName ??
                        (event.eventTypeId === "tmdbFilm"
                            ? "Film"
                            : event.eventTypeId === "KZFzniwnSyZfZ7v7nJ"
                                ? "Music"
                                : event.eventTypeId === "KZFzniwnSyZfZ7v7na"
                                    ? "Arts & Theatre"
                                    : ""),
                    genres: event.genres ?? [],
                    saveCount: event.saveCount ?? 0,
                    attendCount: event.attendCount ?? 0,
                }));
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
                    eventTypeId:
                        data.eventTypeId ??
                        getEventTypeIdFromName(data.eventTypeName) ??
                        "",
                    eventTypeName: data.eventTypeName ?? "",
                    genres: data.genres ?? [],
                    saveCount: data.saveCount ?? 0,
                    eventRepeats: data.eventRepeats ?? [],
                    attendance: data.attendance ?? null,
                };

                setEvent(normalizedEvent);

                const related = getRelatedEvents(normalizedEvent, normalizedAllEvents);
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
    }, [id]);

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

    function isMeaningfulDescription(description) {
        if (!description) return false;

        const text = description.trim();
        if (text.length < 40) return false;

        const words = text.split(/\s+/);
        if (words.length < 6) return false;

        return true;
    }

    function buildFallbackDescription(event) {
        const parts = [];

        if (event?.eventTypeName) {
            parts.push(`This event is part of ${event.eventTypeName}.`);
        }

        if (event?.genres?.length > 0) {
            parts.push(`It is associated with ${event.genres.join(", ")}.`);
        }

        if (event?.venue) {
            parts.push(`It will take place at ${event.venue}.`);
        }

        if (event?.startDateTime) {
            parts.push(`Check the listed event time for attendance details.`);
        }

        if (event?.url) {
            parts.push(`Use the event link for tickets or more information.`);
        }

        return parts.join(" ");
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
            <section className="event-hero__banner">
                <img
                    src={event.posterUrl || "https://via.placeholder.com/1200x700?text=No+Image"}
                    alt={event.title}
                    className="event-hero__image"
                />
                <div className="event-hero__gloss"></div>
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

                    <div className="event-hero__stats">
                        <span>{event.saveCount ?? 0} saved</span>
                        <span>{event.attendCount ?? 0} attending</span>
                    </div>


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

                        <SaveEventButton
                            saved={saved}
                            onToggle={handleToggleSave}
                        />
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

            <div className="event-detail-page event-detail-page--hero">
                <Header />
            </div>

            <div className="container">
                <button
                    type="button"
                    className="btn-back"
                    onClick={() => navigate(-1)}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="faArrowLeft" />
                    <span>{getBreadcrumbText(event)}</span>
                </button>
                {/* <div className="bgl">
                    <img src={bgl} alt="" />
                </div> */}

                <main className="event-hero">
                    <aside className="event-hero__rail">
                        <span className="event-hero__rail-text">WELCOME TO EVENT</span>
                    </aside>


                </main>

                <section className="event-body">
                    <div className="event-body__main">
                        <p className="event-body__eyebrow">WELCOME</p>
                        <h2 className="event-body__title">About this event</h2>

                        <p className="event-body__description">
                            {isMeaningfulDescription(event.description)
                                ? event.description
                                : buildFallbackDescription(event)}
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