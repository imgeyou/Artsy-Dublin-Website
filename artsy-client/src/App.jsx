import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from "react";

import Login from './pages/Login'

import bgl from './assets/images/bgl.png'

import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import mockEvents from "./mock/events";
import EventCard from "./components/events/EventCard";
import EventDetailPage from './pages/EventDetailPage'
import FilterBar from "./components/events/FilterBar";
import MarqueeText from "./components/layout/MarqueeText";

import './index.css'
import './styles/component.css'
import './styles/pages/home.css'

function HomePage() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeFilters]);
  // const [events, setEvents] = useState([]);

  // useEffect(() => {
  //   fetch("http://localhost:3005/events")
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log(data);
  //       setEvents(data);
  //     })
  //     .catch(err => console.error(err));
  // }, []);

  function getEventTags(event) {
    if (event.eventTypeId === "tmdbFilm") return ["Film"];

    return event.description
      ? event.description.split(",").map(tag => tag.trim())
      : [];
  }

  // function getCardVariant(index) {
  //   const variants = ["hero", "small", "small", "wide", "tall", "small"];
  //   return variants[index % variants.length];
  // }

  const filteredEvents = mockEvents
    .filter((event) => {
      if (activeFilters.length === 0) return true;

      const tags = getEventTags(event);
      return activeFilters.some(filter => tags.includes(filter));
    })
    .sort((a, b) => {
      const dateA = a.startDateTime
        ? new Date(a.startDateTime.replace(" ", "T")).getTime()
        : Infinity;

      const dateB = b.startDateTime
        ? new Date(b.startDateTime.replace(" ", "T")).getTime()
        : Infinity;

      return dateA - dateB;
    });

  return (
    <div>
      <Header />
      <div className="container">


        <div className="bgl">
          <img src={bgl} alt="" />
        </div>
        {/* <h1>#Exhibtion</h1> */}

        <FilterBar
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />
        <div className="events_grid">
          {filteredEvents.slice(0, visibleCount).map((event, index) => (
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

        <CalendarSection events={mockEvents} />
        <Footer />
      </div>

    </div>
  );
}


function CalendarSection({ events }) {
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
          {events.slice(0, 3).map(event => (
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
          {events.slice(3, 6).map(event => (
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
        <Route path="/login" element={<Login />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
