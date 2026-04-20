import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/ProfilePage.css";

/* ─── placeholder grid ─── */
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

/* ───Main─── */
export default function ProfilePage() {
  const { dbUser, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);//fake下面是fake的
  const [savedEvents,    setSavedEvents]    = useState([
    { eventId: 9001, title: "Mock Jazz Night", posterUrl: "https://picsum.photos/seed/jazz/400/300", startDateTime: "2025-06-10 20:00:00", venue: "The Button Factory" },
    { eventId: 9002, title: "Mock Art Exhibition", posterUrl: "https://picsum.photos/seed/art/400/300", startDateTime: "2025-06-15 18:00:00", venue: "Irish Museum of Modern Art" },
    { eventId: 9003, title: "Mock Comedy Show", posterUrl: "https://picsum.photos/seed/comedy/400/300", startDateTime: "2025-06-20 21:00:00", venue: "Vicar Street" },
  ]);
  const [loading,        setLoading]        = useState(true);
  const [allGenres,      setAllGenres]      = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Bio state
  const [bio,        setBio]        = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput,   setBioInput]   = useState("");
  const [bioSaving,  setBioSaving]  = useState(false);
  const bioRef = useRef(null);

  const username = dbUser?.userName;

  /* ── fetch── */
  useEffect(() => {
    if (!username) return;
    async function fetchAll() {
      setLoading(true);
      try {
        const [p, a, s, i] = await Promise.all([
          fetch(`/ad-users/${username}`,                 { credentials: "include" }),
          fetch(`/ad-users/${username}/attended-events`, { credentials: "include" }),
          fetch(`/ad-users/${username}/saved-events`,    { credentials: "include" }),
          fetch(`/ad-users/${username}/interests`,       { credentials: "include" }),
        ]);
        if (p.ok) {
          const data = await p.json();
          setProfile(data);
          setBio(data?.bio ?? "");
          setBioInput(data?.bio ?? "");
        }
        if (a.ok) setAttendedEvents(await a.json());
        if (s.ok) setSavedEvents(await s.json());
        if (i.ok) {
          const interests = await i.json();
          setSelectedGenres(interests.map(g => g.genreId));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [username]);

  /* ── fetch genres ── */
  useEffect(() => {
    fetch("/ad-genres", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setAllGenres);
  }, []);

  /* ── close bio editor on outside click ── */
  useEffect(() => {
    if (!editingBio) return;
    function handleOutside(e) {
      if (bioRef.current && !bioRef.current.contains(e.target)) {
        setEditingBio(false);
        setBioInput(bio);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [editingBio, bio]);

  /* ── save bio via PATCH ── */
  async function saveBio() {
    if (bioInput === bio) { setEditingBio(false); return; }
    setBioSaving(true);
    try {
      const res = await fetch(`/ad-users/${username}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioInput }),
      });
      if (res.ok) { setBio(bioInput); setEditingBio(false); }
    } finally {
      setBioSaving(false);
    }
  }

  /* ── redirect if not logged in ── */
  if (!dbUser && !loading) { navigate("/login"); return null; }

  const displayProfile = profile || dbUser;
  const initials       = displayProfile?.userName?.[0]?.toUpperCase() ?? "?";
  const email          = firebaseUser?.email ?? "";

  const genreLabels = selectedGenres
    .map(id => allGenres.find(x => (x.genreId ?? x.id) === id)?.name)
    .filter(Boolean);

  return (
    <div className="pp-page">
      {/* Hollow Pacifico background */}
      <div className="pp-bg-text" aria-hidden="true">Artsy Dublin</div>

      <Header />

      <div className="pp-layout">

        {/* ── HERO ── */}
        <div className="pp-hero">
          <div className="pp-avatar-wrap">
            {displayProfile?.avatarUrl
              ? <img src={displayProfile.avatarUrl} alt="" className="pp-avatar" />
              : <div className="pp-avatar placeholder">{initials}</div>
            }
          </div>

          <h2 className="pp-name">{displayProfile?.userName}</h2>
          {email && <p className="pp-email">{email}</p>}

          {/* Bio — click to edit */}
          <div className="pp-bio-wrap" ref={bioRef}>
            {editingBio ? (
              <div className="pp-bio-editor">
                <textarea
                  className="pp-bio-textarea"
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value)}
                  placeholder="Tell people about yourself…"
                  rows={3}
                  autoFocus
                  maxLength={280}
                />
                <div className="pp-bio-actions">
                  <span className="pp-bio-counter">{bioInput.length}/280</span>
                  <button
                    className="pp-bio-btn cancel"
                    onClick={() => { setEditingBio(false); setBioInput(bio); }}
                  >
                    Cancel
                  </button>
                  <button
                    className="pp-bio-btn save"
                    onClick={saveBio}
                    disabled={bioSaving}
                  >
                    {bioSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`pp-bio${!bio ? " pp-bio--empty" : ""}`}
                onClick={() => setEditingBio(true)}
                title="Click to edit bio"
              >
                {bio || "Add a bio…"}
                <span className="pp-bio-edit-icon">✎</span>
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="pp-stats">
            <div><strong>{attendedEvents.length}</strong><span>Events</span></div>
            <div><strong>{genreLabels.length}</strong><span>Interests</span></div>
            <div><strong>{savedEvents.length}</strong><span>Saved</span></div>
          </div>
        </div>

        {/* ── SECTIONS ── */}
        <main className="pp-main">

          {/* Interests */}
          <Section
            index={0}
            number="01"
            title="My interests"
            count={genreLabels.length > 0 ? `${genreLabels.length} genres` : null}
          >
            <div className="pp-tags">
              {genreLabels.length === 0
                ? <p className="pp-empty-inline">No interests added yet.</p>
                : genreLabels.map((g, i) => (
                    <span
                      key={i}
                      className="pp-chip"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      {g}
                    </span>
                  ))
              }
            </div>
          </Section>

          {/* Journey */}
          <Section
            index={1}
            number="02"
            title="Journey"
            count={attendedEvents.length > 0 ? `${attendedEvents.length} events` : null}
          >
            {loading ? <SkeletonGrid /> : attendedEvents.length === 0 ? (
              <div className="pp-empty">Post a review to record your journey!</div>
            ) : (
              <div className="pp-grid">
                {attendedEvents.map(e => <EventCard key={e.eventId} event={e} />)}
              </div>
            )}
          </Section>

          {/* Saved */}
          <Section
            index={2}
            number="03"
            title="Saved events"
            count={savedEvents.length > 0 ? `${savedEvents.length} events` : null}
          >
            {loading ? <SkeletonGrid /> : savedEvents.length === 0 ? (
              <div className="pp-empty">No saved events yet.</div>
            ) : (
              <div className="pp-grid">
                {savedEvents.map(e => <EventCard key={e.eventId} event={e} />)}
              </div>
            )}
          </Section>

        </main>
      </div>

      <Footer />
    </div>
  );
}