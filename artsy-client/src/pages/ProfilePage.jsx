import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EventCard from "../components/events/EventCard";
import { useAuth } from "../context/AuthContext";
import { checkSaves } from "../utils/postHelpers";
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
  const { dbUser, firebaseUser, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [savedEvents,    setSavedEvents]    = useState([]);
  const [savedEventIds,  setSavedEventIds]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [allGenres,      setAllGenres]      = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Bio state
  const [bio,        setBio]        = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput,   setBioInput]   = useState("");
  const [bioSaving,  setBioSaving]  = useState(false);
  const [bioError,   setBioError]   = useState(null);
  const bioRef = useRef(null);

  // Avatar state
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError,  setAvatarError]  = useState(null);
  const avatarInputRef = useRef(null);

  const username = dbUser?.userName;
  const userId = dbUser?.userId;

  /* ── fetch── */
  useEffect(() => {
    if (!username) return;
    async function fetchAll() {
      setLoading(true);
      try {
        const [p, a, s, i] = await Promise.all([
          fetch(`/ad-users/${username}`,  { credentials: "include" }),
          fetch(`/ad-posts/user/${userId}`,           { credentials: "include" }),
          fetch(`/ad-posts/saves/user/${userId}`,    { credentials: "include" }),
          fetch(`/ad-users/${userId}/userinterests`,   { credentials: "include" }),
        ]);
        if (p.ok) {
          const data = await p.json();
          setProfile(data);
          setBio(data?.bio ?? "");
          setBioInput(data?.bio ?? "");
        }
        const attended = a.ok ? await a.json() : [];
        const saved    = s.ok ? await s.json() : [];
        setAttendedEvents(attended);
        setSavedEvents(saved);
        const allIds = [...attended, ...saved].map(e => e.eventId).filter(Boolean);
        const checkedIds = await checkSaves(allIds);
        setSavedEventIds(checkedIds);
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
    if (bioInput === bio) { setEditingBio(false); 
      //console.log("no edit");
      return; }
    setBioError(null);
    setBioSaving(true);
    try {
      //console.log("i am trying to edit");
      const res = await fetch(`/ad-users/${username}/bio`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioInput }),
      });
      if (res.ok) { 
        //console.log("edit bio successful");
        setBio(bioInput); setEditingBio(false); }
    } catch(err){
      setBioError(err.message);
    }
    finally {
      setBioSaving(false);
    }
  }

  /* ── save avatar via PATCH ── */
  async function saveAvatar(avatarFile) {
    if (!avatarFile) return;
    setAvatarError(null);
    setAvatarSaving(true);
    try {
      const form = new FormData();
      form.append("images", avatarFile);
      const res = await fetch("/ad-users/avatar", {
        method: "PATCH",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to update avatar");
      const [fresh] = await Promise.all([
        fetch(`/ad-users/${username}`, { credentials: "include" }).then(r => r.ok ? r.json() : null),
        refreshAuth(),
      ]);
      if (fresh) setProfile(fresh);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarSaving(false);
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
      <div className="pp-bg-text" aria-hidden="true">Artsy dublin</div>

      <Header />

      <div className="pp-layout">

        {/* ── HERO ── */}
        <div className="pp-hero">
          <div className="pp-avatar-wrap">
            {displayProfile?.avatarUrl
              ? <img src={displayProfile.avatarUrl} alt="" className="pp-avatar" />
              : <div className="pp-avatar placeholder">{initials}</div>
            }
            <button
              className="pp-avatar-edit-btn"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarSaving}
              title="Change profile photo"
            >
              {avatarSaving ? "…" : "✎"}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => { saveAvatar(e.target.files[0]); e.target.value = ""; }}
            />
            {avatarError && <p className="pp-avatar-error">{avatarError}</p>}
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
                {bioError && <p className="pp-avatar-error">{bioError}</p>}
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
                {attendedEvents.map((e, i) => <EventCard key={`${e.eventId}-${i}`} event={e} savedInit={savedEventIds.includes(e.eventId)} />)}
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
                {savedEvents.map(e => <EventCard key={e.eventId} event={e} savedInit={savedEventIds.includes(e.eventId)} />)}
              </div>
            )}
          </Section>

        </main>
      </div>

      <Footer />
    </div>
  );
}