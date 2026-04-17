// UserProfile is public profile page for any user
// Access at /users/:username
// Shows the user's avatar, name, bio, send message btn, opens (or creates) a direct conversation with that user

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/messaging.css";

export default function UserProfile() {
  const { username } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/ad-users/${username}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

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

  if (loading) return <div className="profile-page"><p className="chat-hint"> Loading…</p></div>;
  if (error) return <div className="profile-page"><p className="profile-error">{error}</p></div>;

  const isOwnProfile = dbUser?.userId === profile.userId;

  return (

    <div className="profile-page">
      <div className="profile-inner">
        <Link to="/messages" className="profile-back-link">Back to messages</Link>

        <div className="profile-card">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.userName} className="profile-avatar"/>
          ) : (
            <div className = "profile-avatar-placeholder">{profile.userName[0].toUpperCase() }</div>
          )}

          <h1 className="profile-name">{profile.userName}</h1>
          {profile.bio && <p className ="profile-bio">{profile.bio}</p>}

          {!isOwnProfile && dbUser && (
            <button onClick={handleSendMessage} disabled={starting} className="profile-message-btn">
              {starting ? "Opening chat…" : "Send Message"}
            </button>
          )}

          {!dbUser && (
            <p className="profile-login-hint"><Link to="/login">Log in </Link> to send a message</p>
          )}

        </div>
      </div>
    </div>
  );

}
