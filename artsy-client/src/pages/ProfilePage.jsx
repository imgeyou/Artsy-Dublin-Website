import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/ProfilePage.css";

function SkeletonGrid() {
  return (
    <div className="pp-grid">
      {[1, 2, 3, 4].map((i) => <div key={i} className="pp-skeleton" />)}
    </div>
  );
}

export default function ProfilePage() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allGenres, setAllGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreSaving, setGenreSaving] = useState(false);
  const [genreMsg, setGenreMsg] = useState("");
  const [genreOpen, setGenreOpen] = useState(false);

  const username = dbUser?.userName;

  useEffect(() => {
    if (!username) return;
    async function fetchAll() {
      setLoading(true);
      try {
        const [profileRes, attendedRes, savedRes, interestsRes] = await Promise.all([
          fetch(`/ad-users/${username}`, { credentials: "include" }),
          fetch(`/ad-users/${username}/attended-events`, { credentials: "include" }),
          fetch(`/ad-users/${username}/saved-events`, { credentials: "include" }),
          fetch(`/ad-users/${username}/interests`, { credentials: "include" }),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (attendedRes.ok) setAttendedEvents(await attendedRes.json());
        if (savedRes.ok) setSavedEvents(await savedRes.json());
        if (interestsRes.ok) {
          const interests = await interestsRes.json();
          setSelectedGenres(interests.map(g => g.genreId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [username]);

  useEffect(() => {
    fetch("/ad-genres", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllGenres(Array.isArray(data) ? data : []));
  }, []);

  const toggleGenre = (id) => {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    setGenreMsg("");
  };

  const saveGenres = async () => {
    setGenreSaving(true);
    try {
      const res = await fetch(`/ad-users/${username}/interests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ genreIds: selectedGenres }),
      });
      setGenreMsg(res.ok ? "Saved!" : "Failed.");
    } catch { setGenreMsg("Failed."); }
    finally { setGenreSaving(false); }
  };

  if (!dbUser && !loading) { navigate("/login"); return null; }

  const displayProfile = profile || dbUser;
  const initials = displayProfile?.userName?.[0]?.toUpperCase() ?? "?";
  const genreLabels = selectedGenres.slice(0, 3).map(id => {
    const g = allGenres.find(x => (x.genreId ?? x.id) === id);
    return g?.name;
  }).filter(Boolean);

  return (
    <div className="pp-page">
      <Header />

      {/* ── HERO ── */}
      <section className="pp-hero">
        <div className="pp-hero__bg-name" aria-hidden="true">
          {(displayProfile?.userName ?? "").toUpperCase()}
        </div>

        <div className="pp-hero__left">
          <div className="pp-avatar-ring">
            {displayProfile?.avatarUrl
              ? <img src={displayProfile.avatarUrl} alt={displayProfile.userName} className="pp-avatar" />
              : <div className="pp-avatar pp-avatar--placeholder">{initials}</div>
            }
          </div>
          <div className="pp-hero__label">
            <span className="pp-label-text">Artsy Dublin</span>
            <span className="pp-label-dot" />
            <span className="pp-label-text">Member</span>
          </div>
        </div>

        <div className="pp-hero__right">
          <p className="pp-eyebrow">Profile</p>
          <h1 className="pp-name">{displayProfile?.userName ?? "—"}</h1>

          {genreLabels.length > 0 && (
            <p className="pp-genres-inline">{genreLabels.join(" · ")}</p>
          )}

          {profile?.bio && <p className="pp-bio">{profile.bio}</p>}

          <div className="pp-stats">
            <div className="pp-stat">
              <span className="pp-stat__num">{attendedEvents.length}</span>
              <span className="pp-stat__label">Attended</span>
            </div>
            <div className="pp-stat__divider" />
            <div className="pp-stat">
              <span className="pp-stat__num">{savedEvents.length}</span>
              <span className="pp-stat__label">Saved</span>
            </div>
          </div>

          <button className="pp-genre-toggle" onClick={() => setGenreOpen(o => !o)}>
            {genreOpen ? "Close interests ↑" : "Edit interests ↓"}
          </button>

          {genreOpen && (
            <div className="pp-genre-panel">
              <div className="pp-genre-grid">
                {allGenres.map(g => {
                  const id = g.genreId ?? g.id;
                  const name = g.name ?? g.genreName;
                  return (
                    <button
                      key={id}
                      className={`pp-genre-tag ${selectedGenres.includes(id) ? "is-active" : ""}`}
                      onClick={() => toggleGenre(id)}
                    >{name}</button>
                  );
                })}
              </div>
              <div className="pp-genre-actions">
                <button className="pp-genre-save" onClick={saveGenres} disabled={genreSaving}>
                  {genreSaving ? "Saving…" : "Save"}
                </button>
                {genreMsg && <span className="pp-genre-msg">{genreMsg}</span>}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="pp-body">

        {/* ── JOURNEY ── */}
        <section className="pp-section">
          <div className="pp-section__head">
            <span className="pp-section__num">01</span>
            <h2 className="pp-section__title">Journey</h2>
            <div className="pp-section__line" />
          </div>

          {loading ? <SkeletonGrid /> : attendedEvents.length === 0 ? (
            <p className="pp-empty">No attended events yet. <em>Post reviews to record attended events.</em></p>
          ) : (
            <div className="pp-timeline">
              {attendedEvents.map((event, i) => (
                <div key={event.eventId} className="pp-timeline__item">
                  <div className="pp-timeline__index">{String(i + 1).padStart(2, "0")}</div>
                  <div className="pp-timeline__card">
                    <EventCard event={event} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SAVED ── */}
        <section className="pp-section">
          <div className="pp-section__head">
            <span className="pp-section__num">02</span>
            <h2 className="pp-section__title">Saved</h2>
            <div className="pp-section__line" />
          </div>

          {loading ? <SkeletonGrid /> : savedEvents.length === 0 ? (
            <p className="pp-empty">No saved events yet.</p>
          ) : (
            <div className="pp-grid">
              {savedEvents.map(event => (
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
