import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import "../styles/pages/ProfilePage.css";

function SkeletonGrid() {
  return (
    <div className="pp-grid">
      {[1, 2, 3].map((i) => <div key={i} className="pp-skeleton" />)}
    </div>
  );
}

function Section({ index, number, title, count, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`pp-section${visible ? " pp-section--visible" : ""}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <div className="pp-section-number" aria-hidden="true">{number}</div>
      <div className="pp-section-head">
        <h3 className="pp-title">{title}</h3>
        {count != null && <span className="pp-title-count">{count}</span>}
      </div>
      {children}
    </section>
  );
}

export default function UserProfile() {
  const { username } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [allGenres,      setAllGenres]      = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [starting,       setStarting]       = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/ad-users/${username}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(async (data) => {
        setProfile(data);
        const [a, i] = await Promise.all([
          fetch(`/ad-posts/user/${data.userId}`,          { credentials: "include" }),
          fetch(`/ad-users/${data.userId}/userinterests`, { credentials: "include" }),
        ]);
        if (a.ok) setAttendedEvents(await a.json());
        if (i.ok) {
          const interests = await i.json();
          setSelectedGenres(interests.map(g => g.genreId));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    fetch("/ad-genres", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setAllGenres);
  }, []);

  async function handleSendMessage() {
    if (!dbUser) return navigate("/login");
    setStarting(true);
    try {
      const res = await fetch("/ad-messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId: profile.userId }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Could not start conversation");
      }
      const { conversationId } = await res.json();
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setStarting(false);
    }
  }

  if (loading) return (
    <div className="pp-page">
      <Header />
      <div className="pp-layout"><p className="pp-empty-inline">Loading…</p></div>
    </div>
  );

  if (error) return (
    <div className="pp-page">
      <Header />
      <div className="pp-layout"><p className="pp-empty-inline">{error}</p></div>
    </div>
  );

  const isOwnProfile = dbUser?.userId === profile.userId;
  const initials     = profile.userName?.[0]?.toUpperCase() ?? "?";

  const genreLabels = selectedGenres
    .map(id => allGenres.find(x => (x.genreId ?? x.id) === id)?.name)
    .filter(Boolean);

  return (
    <div className="pp-page">
      <div className="pp-bg-text" aria-hidden="true">Artsy dublin</div>

      <Header />

      <div className="pp-layout">

        {/* ── HERO ── */}
        <div className="pp-hero">
          <div className="pp-avatar-wrap">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt="" className="pp-avatar" />
              : <div className="pp-avatar placeholder">{initials}</div>
            }
          </div>

          <h2 className="pp-name">{profile.userName}</h2>

          {profile.bio && (
            <div className="pp-bio-wrap">
              <p className="pp-bio" style={{ cursor: "default" }}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="pp-stats">
            <div><strong>{attendedEvents.length}</strong><span>Events</span></div>
            <div><strong>{genreLabels.length}</strong><span>Interests</span></div>
          </div>

          {/* Message button */}
          {!isOwnProfile && dbUser && (
            <button
              onClick={handleSendMessage}
              disabled={starting}
              className="pp-bio-btn save"
              style={{ marginTop: "24px", padding: "12px 32px", fontSize: "13px" }}
            >
              {starting ? "Opening chat…" : "Send Message"}
            </button>
          )}

          {!isOwnProfile && !dbUser && (
            <p className="pp-empty-inline" style={{ marginTop: "20px" }}>
              <Link to="/login" style={{ color: "var(--pp-accent)" }}>Log in</Link> to send a message
            </p>
          )}

          {isOwnProfile && (
            <Link
              to="/profile"
              className="pp-bio-btn save"
              style={{ marginTop: "24px", padding: "12px 32px", fontSize: "13px", display: "inline-block" }}
            >
              Edit My Profile
            </Link>
          )}
        </div>

        {/* ── SECTIONS ── */}
        <main className="pp-main">

          <Section
            index={0}
            number="01"
            title="Interests"
            count={genreLabels.length > 0 ? `${genreLabels.length} genres` : null}
          >
            <div className="pp-tags">
              {genreLabels.length === 0
                ? <p className="pp-empty-inline">No interests added yet.</p>
                : genreLabels.map((g, i) => (
                    <span key={i} className="pp-chip" style={{ animationDelay: `${i * 0.07}s` }}>
                      {g}
                    </span>
                  ))
              }
            </div>
          </Section>

          <Section
            index={1}
            number="02"
            title="Journey"
            count={attendedEvents.length > 0 ? `${attendedEvents.length} events` : null}
          >
            {attendedEvents.length === 0 ? (
              <div className="pp-empty">No events attended yet.</div>
            ) : (
              <div className="pp-grid">
                {attendedEvents.map(e => <EventCard key={e.eventId} event={e} />)}
              </div>
            )}
          </Section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
