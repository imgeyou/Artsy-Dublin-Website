import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import mockEvents from "../mock/events";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import bgl from '../assets/images/bgl.png'
import hostAvatar from '../assets/images/avatar.jpeg'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import '../index.css'
import '../styles/pages/event-detail.css'



function EventDetailPage() {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const { id } = useParams();

    const event = mockEvents.find(
        (item) => item.eventId === Number(id)
    );

    if (!event) {
        return <p>Event not found</p>;
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

                <main className="event-detail">
                    <div className="event-detail_image-wrap">
                        <img
                            src={event.posterUrl}
                            alt={event.title}
                            className="event-detail_image"
                        />
                    </div>

                    <div className="event-detail_content">
                        <div className="event-header">
                            <div className="event-header_top">
                                <p className="event-detail_category">
                                    {event.description || "Arts & Culture"}
                                </p>
                                <button
                                    className={`btn-secondary btn-save-detail ${saved ? "is-saved" : ""}`}
                                    onClick={() => setSaved(!saved)}
                                >
                                    <FontAwesomeIcon icon={saved ? solidBookmark : regularBookmark} />
                                    {/* <span>{saved ? "Saved" : "Save Event"}</span> */}
                                </button>
                            </div>
                            <h1 className="event-detail_title">{event.title}</h1>
                            <div className="event-host">
                                <div className="event-host__avatar">
                                    <img src={hostAvatar} alt="host" />
                                    <span className="event-host__name">Hosted by Brian</span>
                                </div>

                                <button className="btn btn-follow">Follow</button>
                            </div>

                        </div>
                        <div className="event-info">
                            <h2 className="event-detail_subtitle">Event Details</h2>
                            <div className="event-detail_meta-item">
                                <FontAwesomeIcon icon={faCalendarDays} className="event-detail_icon" />
                                <p className="event-detail_time">{formattedDate}</p>
                            </div>
                            {/* <p className="event-detail_time">{formattedDate}</p> */}
                            <div className="event-detail_meta-item">
                                <FontAwesomeIcon icon={faLocationDot} className="event-detail_icon" />
                                <p className="event-detail_venue">{event.venue || "Venue TBA"}</p>
                            </div>

                            <p className="event-detail_description">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is where
                                your event detail description can go later when backend data is ready.
                            </p>
                        </div>
                        <div className="event-actions">
                            <a href={event.url} target="_blank" rel="noopener noreferrer"
                                className="btn btn-primary"
                            >Get Tickets</a>

                            <button className="btn btn-outline">Log attendance</button>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}

export default EventDetailPage;