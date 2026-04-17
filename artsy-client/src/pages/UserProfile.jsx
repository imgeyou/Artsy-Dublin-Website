// UserProfile is public profile page for any user
// Access at /users/:username
// Shows the user's avatar, name, bio, send message btn, opens (or creates) a direct conversation with that user

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
 const { username } = useParams();
 const { dbUser } =  useAuth();
 const navigate = useNavigate();
 const  [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError]  = useState(null);
 const [starting, setStarting] = useState(false) ;

  useEffect(() => {
   setLoading(true);
   setError(null);
   fetch(`/users/${username}`, { credentials: "include" })
      .then((res) => {
       if (!res.ok) throw new Error("User not found");
       return res.json();
     })
     .then((data) => setProfile(data))
     .catch((err) => setError(err.message))
     .finally(() => setLoading(false));
  },  [username]);

  async function handleSendMessage() {
   if (!dbUser) return navigate("/login");
   setStarting(true);
   try{
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

  if (loading) return <div style={styles.page}><p> Loading... </p></div>;
  if (error) return <div style={styles.page}><p style={styles.error}>{error}</p></div>;

  const isOwnProfile = dbUser?.userId === profile.userId;

//frontend team REDO please-----------------------------------------
  return (
    <div style={styles.page}>
      <Link to="/messages" style={styles.backLink}>← Back to messages</Link>

      <div style={styles.card}>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.userName} style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>{profile.userName[0].toUpperCase()}</div>
        )}

        <h1 style={styles.name}>{profile.userName}</h1>
        {profile.bio && <p style={styles.bio}>{profile.bio}</p>}

        {!isOwnProfile && dbUser && (
          <button
            onClick={handleSendMessage}
            disabled={starting}
            style={styles.messageBtn}
          >
            {starting ? "Opening chat…" : "Send Message"}
          </button>
        )}

        {!dbUser && (
          <p style={styles.hint}>
            <Link to="/login">Log in</Link> to send a message.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 480,
    margin: "40px auto",
    padding: "0 16px",
    fontFamily: "sans-serif",
  },
  backLink: {
    display: "inline-block",
    marginBottom: 24,
    color: "#555",
    textDecoration: "none",
    fontSize: 14,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 32,
    textAlign: "center",
    background: "#fff",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    color: "#fff",
    margin: "0 auto 16px",
  },
  name: { margin: "0 0 8px", fontSize: 24 },
  bio:  { color: "#666", marginBottom: 24 },
  messageBtn: {
    padding: "10px 28px",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
  },
  hint: { color: "#888", fontSize: 14 },
  error: { color: "red" },
};