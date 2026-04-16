import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import { useAuth } from "../context/AuthContext";
import bgl from "../assets/images/bgl.png";
import "./ProfilePage.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3005";

function SkeletonGrid() {
  return (
    <div className="profile-events-grid">
      {[1, 2, 3, 4].map((i) => <div key={i} className="profile-skeleton" />)}
    </div>
  );
}

export default function ProfilePage() {
  const { dbUser } = useAuth();
  const navigate   = useNavigate();

  const [profile, setProfile]               = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [savedEvents, setSavedEvents]       = useState([]);
  const [loading, setLoading]               = useState(true);

  const username = dbUser?.userName;

  useEffect(() => {
    if (!username) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [profileRes, attendedRes, savedRes] = await Promise.all([
          fetch(`${API}/users/${username}`),
          fetch(`${API}/users/${username}/attended-events`),
          fetch(`${API}/users/${username}/saved-events`),
        ]);
        if (profileRes.ok)  setProfile(await profileRes.json());
        if (attendedRes.ok) setAttendedEvents(await attendedRes.json());
        if (savedRes.ok)    setSavedEvents(await savedRes.json());
      } catch (err) {
        console.error("ProfilePage fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [username]);

  if (!dbUser && !loading) {
    navigate("/login");
    return null;
  }

  const displayProfile = profile || dbUser;

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-bgl" aria-hidden="true">
        <img src={bgl} alt="" />
      </div>

      <div className="profile-container">

        {/* ── Profile Header ── */}
        <section className="profile-header">
          {displayProfile?.avatarUrl ? (
            <img
              src={displayProfile.avatarUrl}
              alt={displayProfile.userName}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar profile-avatar--placeholder">
              {displayProfile?.userName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          <div className="profile-info">
            <h1 className="profile-name">{displayProfile?.userName ?? "—"}</h1>
            {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <span className="profile-stat">
                <strong>{attendedEvents.length}</strong> attended
              </span>
              <span className="profile-stat">
                <strong>{savedEvents.length}</strong> saved
              </span>
            </div>
          </div>
        </section>

        {/* ── Attended Events ── */}
        <section className="profile-section">
          <h2 className="profile-section-title">Attended Events</h2>
          <div className="profile-section-line" />

          {loading ? <SkeletonGrid /> : attendedEvents.length === 0 ? (
            <p className="profile-empty">No attended events yet.</p>
          ) : (
            <div className="profile-events-grid">
              {attendedEvents.map((event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* ── Saved Events ── */}
        <section className="profile-section">
          <h2 className="profile-section-title">Saved Events</h2>
          <div className="profile-section-line" />

          {loading ? <SkeletonGrid /> : savedEvents.length === 0 ? (
            <p className="profile-empty">No saved events yet.</p>
          ) : (
            <div className="profile-events-grid">
              {savedEvents.map((event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
            </div>
          )}
        </section>

      </div>

      <Footer />
    </div>
  );
}
