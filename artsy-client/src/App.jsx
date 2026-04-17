import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from "react";

import Login from './pages/Login'

import bgl from './assets/images/bgl.png'

import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
// import mockEvents from "./mock/events";
import EventCard from "./components/events/EventCard";
import EventDetailPage from './pages/EventDetailPage'
import PostDetailPage from "./pages/PostDetailPage";
import PostsPage from "./pages/PostsPage";
import FilterBar from "./components/events/FilterBar";
import MarqueeText from "./components/layout/MarqueeText";
import Register from "./pages/register";
import TeamPage from "./pages/TeamPage"
import Me from "./pages/Me";
import ProfilePage from "./pages/ProfilePage";

import './index.css'
import './styles/component.css'
import './styles/pages/home.css'

function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeCategories, setActiveCategories] = useState([]);
  const [activeDate, setActiveDate] = useState("Upcoming");
  const [sortOrder, setSortOrder] = useState("Soonest");
  const [visibleCount, setVisibleCount] = useState(8);


  // useEffect(() => {
  //   fetch("http://localhost:3005/events")
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log(data);
  //       setEvents(data);
  //     })
  //     .catch(err => console.error(err));
  // }, []);
  useEffect(() => {
    setVisibleCount(8);
  }, [activeCategories, activeDate, sortOrder]);

  // const API_BASE_URL =
  //   import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/ad-events`);

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
          eventTypeId: event.eventTypeId ?? ""
        }));

        setEvents(normalizedEvents);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Could not load live events. Showing mock data instead.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  function getEventTags(event) {
    if (event.eventTypeId === "tmdbFilm") return ["Film"];

    return event.description
      ? event.description.split(",").map(tag => tag.trim())
      : [];
  }

  const today = new Date();

  const filteredEvents = events
    .filter((event) => {
      const matchesCategory =
        activeCategories.length === 0 ||
        activeCategories.some(category => getEventTags(event).includes(category));

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

      return matchesCategory && matchesDate;
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

      return sortOrder === "Soonest"
        ? dateA - dateB
        : dateB - dateA;
    });

  return (
    <div>
      <Header />
      <div className="container">

        <div className="bgl">
          <img src={bgl} alt="bgl" />
        </div>
        {/* <h1>#Exhibtion</h1> */}

        <div className="home-hero">
          <div className="home-hero__info"
          ><h1 className="home-hero__title">What’s On</h1>
            <p className="home-hero__subtitle">
              Discover events, films, comedy and more across Dublin
            </p>
          </div>

          <FilterBar
            activeCategories={activeCategories}
            setActiveCategories={setActiveCategories}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>

        {loading && <p className="status-message">Loading events...</p>}
        {error && <p className="status-message error">{error}</p>}
        {filteredEvents.length === 0 && !loading && (
          <p className="status-message">No matching events found.</p>
        )}

        <div className="events_grid">
          {filteredEvents.slice(0, visibleCount).map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
            // variant={getCardVariant(index)}
            />
          ))}
        </div>
        {visibleCount < filteredEvents.length && (
          <div className="show-more-wrap">
            <button
              className="show-more-btn"
              onClick={() => setVisibleCount(visibleCount + 8)}
            >
              Show More
            </button>
          </div>
        )}

        <MarqueeText />

        <CalendarSection events={events} />
        <Footer />
      </div>

    </div>
  );
}

function CalendarSection({ events }) {
  const datedEvents = events.filter(event => event.startDateTime);

  return (
    <section className="calendar">

      {/* Top Header */}
      <div className="calendar__header">
        <h2 className="calendar__title">Calendar</h2>
        <a href="#" className="calendar__link">
          ALL CREATED EVENTS →
        </a>
      </div>

      {/* Today */}
      <div className="calendar__group">
        <div className="calendar__group-header">
          <h3>Today</h3>
          <span>↑</span>
        </div>

        <div className="calendar__grid">
          {datedEvents.slice(0, 3).map(event => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </div>

      {/* Tomorrow */}
      <div className="calendar__group">
        <div className="calendar__group-header">
          <h3>Tomorrow</h3>
          <span>↑</span>
        </div>

        <div className="calendar__grid">
          {datedEvents.slice(3, 6).map(event => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      </div>

      {/* Collapsed sections */}
      <div className="calendar__collapsed">
        <div className="calendar__collapsed-row">
          <span>This week</span>
          <span>↓</span>
        </div>

        <div className="calendar__collapsed-row">
          <span>Next week</span>
          <span>↓</span>
        </div>
      </div>

    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={
          <div className="auth-layout">
            <div className="auth-bg-blur" aria-hidden="true"><HomePage /></div>
            <Login />
          </div>
        } />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/register" element={
          <div className="auth-layout">
            <div className="auth-bg-blur" aria-hidden="true"><HomePage /></div>
            <Register />
          </div>
        } />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/me" element={<Me />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
