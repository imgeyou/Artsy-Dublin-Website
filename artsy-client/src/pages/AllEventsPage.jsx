import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import FilterBar from "../components/events/FilterBar";
import mockEvents from "../mock/events";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { checkSaves } from "../utils/postHelpers";

import "../index.css";
import "../styles/component.css";
import "../styles/pages/home.css";
import "../styles/pages/all-events.css";

function getEventTypeLabel(eventTypeId) {
    if (eventTypeId === "tmdbFilm") return "Film";
    if (eventTypeId === "KZFzniwnSyZfZ7v7nJ") return "Music";
    if (eventTypeId === "KZFzniwnSyZfZ7v7na") return "Arts & Theatre";
    return "Other";
}

export default function AllEventsPage() {
    const { dbUser } = useAuth();
    const [events, setEvents] = useState(mockEvents);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedEventIds, setSavedEventIds] = useState([]);
    const saveCheckedRef = useRef(false);

    const [activeCategories, setActiveCategories] = useState([]);
    const [activeDate, setActiveDate] = useState("Upcoming");
    const [sortOrder, setSortOrder] = useState("Soonest");

    const [visibleCount, setVisibleCount] = useState(12);

    // 真正拿來搜尋的字
    const [searchTerm, setSearchTerm] = useState("");

    // input 內正在輸入的字
    const [inputValue, setInputValue] = useState("");

    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const handleScroll = () => setOffset(window.pageYOffset);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        async function loadEvents() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/ad-events");

                if (!res.ok) {
                    throw new Error("Failed to fetch events");
                }

                const data = await res.json();

                const normalizedEvents = data.map((event, index) => ({
                    eventId: event.eventId ?? index,
                    title: event.title ?? "",
                    url: event.url ?? "",
                    description: event.description ?? "",
                    venue: event.venue ?? "",
                    startDateTime: event.startDateTime ?? "",
                    posterUrl: event.posterUrl ?? event.posterURL ?? "",
                    attendCount: event.attendCount ?? 0,
                    reviewCount: event.reviewCount ?? 0,
                    saveCount: event.saveCount ?? 0,
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
                }));

                setEvents(normalizedEvents);
            } catch (err) {
                console.error(err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    useEffect(() => {
        if (!dbUser?.userId || loading || !events.length) return;
        checkSaves(events.map((e) => e.eventId))
            .then(setSavedEventIds)
            .catch((err) => console.error("Failed to check saves:", err));
    }, [events, dbUser?.userId, loading]);

    useEffect(() => {
        setVisibleCount(12);
    }, [activeCategories, activeDate, sortOrder, searchTerm]);

    const filteredEvents = useMemo(() => {
        const today = new Date();

        return events
            .filter((event) => {
                const matchesCategory =
                    activeCategories.length === 0 ||
                    activeCategories.includes(getEventTypeLabel(event.eventTypeId));

                let matchesDate = true;

                if (event.startDateTime) {
                    const eventDate = new Date(event.startDateTime.replace(" ", "T"));

                    if (activeDate === "Upcoming") {
                        matchesDate = eventDate >= today;
                    }

                    if (activeDate === "This Week") {
                        const nextWeek = new Date();
                        nextWeek.setDate(today.getDate() + 7);
                        matchesDate = eventDate >= today && eventDate <= nextWeek;
                    }

                    if (activeDate === "This Month") {
                        matchesDate =
                            eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    }
                }

                const search = searchTerm.trim().toLowerCase();

                const matchesSearch =
                    search === "" ||
                    event.title?.toLowerCase().includes(search) ||
                    event.venue?.toLowerCase().includes(search) ||
                    event.description?.toLowerCase().includes(search) ||
                    event.eventTypeName?.toLowerCase().includes(search);

                return matchesCategory && matchesDate && matchesSearch;
            })
            .sort((a, b) => {
                const dateA = a.startDateTime
                    ? new Date(a.startDateTime.replace(" ", "T"))
                    : null;
                const dateB = b.startDateTime
                    ? new Date(b.startDateTime.replace(" ", "T"))
                    : null;

                if (!dateA) return 1;
                if (!dateB) return -1;

                return sortOrder === "Soonest" ? dateA - dateB : dateB - dateA;
            });
    }, [events, activeCategories, activeDate, sortOrder, searchTerm]);

    function handleSearchSubmit() {
        setSearchTerm(inputValue.trim());
    }

    return (
        <>
            <div className="home-header-overlay">
                <Header />
            </div>

            <main className="all-events-page">
                <section className="all-events-dark">
                    <div className="all-events-shell">
                        <div className="all-events-top">
                            <div className="all-events-heading" style={{ transform: `translateY(${offset * 0.2}px)` }}>
                                <p className="all-events-eyebrow">DISCOVER</p>
                                <h1 className="all-events-title">All Events</h1>
                                <p className="all-events-subtitle">
                                    Search and explore events across Dublin
                                </p>
                            </div>

                            <div className="all-events-search">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder="Search by title, venue, category..."
                                    className="all-events-search__input"
                                />
                                <button
                                    type="button"
                                    className="all-events-search__button"
                                    onClick={handleSearchSubmit}
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <section className="all-events-toolbar">
                            <div className="all-events-pills">
                                {["Music", "Film", "Arts & Theatre"].map((category) => {
                                    const active = activeCategories.includes(category);

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            className={`all-events-pill ${active ? "is-active" : ""}`}
                                            onClick={() => {
                                                setActiveCategories((prev) =>
                                                    prev.includes(category)
                                                        ? prev.filter((item) => item !== category)
                                                        : [...prev, category]
                                                );
                                            }}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="all-events-pills all-events-pills--date">
                                {["Upcoming", "This Week", "This Month"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`all-events-pill ${activeDate === option ? "is-active" : ""}`}
                                        onClick={() => setActiveDate(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {searchTerm && (
                            <p className="all-events-results-text">
                                Showing results for <strong>{searchTerm}</strong>
                            </p>
                        )}

                        {loading && <p className="status-message">Loading events...</p>}
                        {error && <p className="status-message error">{error}</p>}
                        {!loading && filteredEvents.length === 0 && (
                            <p className="status-message">No matching events found.</p>
                        )}

                        {!loading && filteredEvents.length > 0 && (
                            <>
                                <section className="all-events-carousel-section">
                                    <div className="all-events-section-head">
                                        <div>
                                            <p className="all-events-section-kicker">FEATURED</p>
                                            <h2>Browse Events</h2>
                                        </div>
                                    </div>

                                    <div className="all-events-carousel">
                                        {filteredEvents.slice(0, 12).map((event) => (
                                            <Link to={`/events/${event.eventId}`}
                                                key={event.eventId ?? event.title}
                                                className="all-events-poster-card"
                                            >
                                                <div className="all-events-poster-media">
                                                    <img
                                                        src={
                                                            event.posterUrl ||
                                                            "https://via.placeholder.com/600x900?text=No+Image"
                                                        }
                                                        alt={event.title}
                                                    />
                                                    <span className="all-events-poster-tag">
                                                        {event.eventTypeName || getEventTypeLabel(event.eventTypeId)}
                                                    </span>

                                                    <div className="all-events-poster-body">
                                                        <h3>{event.title}</h3>
                                                        <p>{event.venue || "Venue TBA"}</p>
                                                        <span>{event.startDateTime || "Date TBA"}</span>
                                                    </div>
                                                </div>


                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                {/* <section className="all-events-grid-section">
                                <div className="all-events-section-head">
                                    <div>
                                        <p className="all-events-section-kicker">MORE TO EXPLORE</p>
                                        <h2>All Results</h2>
                                    </div>
                                </div>

                                <div className="events_grid all-events-results-grid">
                                    {filteredEvents.slice(0, visibleCount).map((event) => (
                                        <EventCard key={event.eventId ?? event.title} event={event} />
                                    ))}
                                </div>

                                {visibleCount < filteredEvents.length && (
                                    <div className="show-more-wrap">
                                        <button
                                            className="show-more-btn"
                                            onClick={() => setVisibleCount((prev) => prev + 12)}
                                        >
                                            Show More
                                        </button>
                                    </div>
                                )}
                            </section> */}
                            </>
                        )}
                    </div>
                </section>

                <section className="all-events-light">
                    <div className="all-events-shell">
                        <section className="all-events-grid-section">
                            <div className="all-events-section-head">
                                <div>
                                    <p className="all-events-section-kicker">MORE TO EXPLORE</p>
                                    <h2>All Results</h2>
                                </div>
                            </div>

                            <div className="events_grid all-events-results-grid">
                                {filteredEvents.slice(0, visibleCount).map((event) => (
                                    <EventCard key={event.eventId ?? event.title} event={event} savedInit={savedEventIds.includes(event.eventId)} />
                                ))}
                            </div>

                            {visibleCount < filteredEvents.length && (
                                <div className="show-more-wrap">
                                    <button
                                        className="show-more-btn"
                                        onClick={() => setVisibleCount((prev) => prev + 12)}
                                    >
                                        Show More
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}