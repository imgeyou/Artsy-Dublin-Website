// Inbox shows all conversations for the logged-in user, newest convos come first
// Each row shows the other user's name/avatar, last message preview, unread badge,delete button
//  'Find Users' section at the bottom lists all registered users so user can navigate to their profile and start chatting

import  { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket  from "../utils/socket" ;

export default function Inbox() {
  const { dbUser, firebaseUser } = useAuth();
 const navigate = useNavigate();

 const [conversations, setConversations] = useState([]);
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const loadInbox = useCallback(async () => {
   try {
     const res = await fetch("/messages/conversations",  { credentials: "include" });
     if (!res.ok) throw new Error("Failed to load conversations");
     const data = await res.json();

     setConversations(data);
    }catch (err) {
     setError(err.message);

    }finally {
     setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
   try {
     const res = await fetch("/ad-users/", { credentials: "include" });
     if (!res.ok) return;
     const data = await res.json();
     setUsers(data);
    } catch {
      // users list is nice to have, ignore failures
    }
  }, []);

  useEffect(() => {
   if (!firebaseUser) return;
   loadInbox();
   loadUsers();
  },   [firebaseUser, loadInbox, loadUsers]);

  // Update inbox preview in real time when new message arrives
  useEffect(() => {
   function onNewMessage(msg) {
     setConversations((prev) => {
       const existing = prev.find((c) => c.conversationId === msg.conversationId);
        if (existing) {
          // Move conversation to top and update preview.
       const updated = {
            ...existing,
           lastMessage: msg.content,
           lastMessageAt: msg.createdAt,
           unreadCount:
             msg.senderId !== dbUser?.userId
               ? (existing.unreadCount || 0) + 1
               : existing.unreadCount,
         };
         return [updated, ...prev.filter((c) => c.conversationId !== msg.conversationId)] ;
       }
        // New conversation not yet in the list -> reload  full inbox
       loadInbox();
       return prev;
     });
    }
   socket.on("new_message", onNewMessage);
   return () => socket.off("new_message", onNewMessage);
  },  [dbUser, loadInbox]);

 async function handleDelete(conversationId) {
   if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
   try {
     const res = await fetch(`/messages/conversations/${conversationId}`, {
       method: "DELETE",
       credentials: "include",
     });
     if (!res.ok) throw new Error("Could not delete conversation");
    setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId));
    } catch (err) {
     alert(err.message);
    }
  }

 if (firebaseUser === undefined) return <div style={styles.page}><p> Loading... </p></div> ;
 if (!firebaseUser) {
   navigate("/login");
   return null;
  }

//frontend team - REDO please---------------
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
        <Link to="/" style={styles.homeLink}>← Home</Link>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p>Loading conversations…</p>
      ) : conversations.length === 0 ? (
        <p style={styles.empty}>No conversations yet. Find a user below to start chatting.</p>
      ) : (
        <ul style={styles.list}>
          {conversations.map((conv) => (
            <li key={conv.conversationId} style={styles.item}>
              <Link to={`/messages/${conv.conversationId}`} style={styles.convLink}>
                <div style={styles.avatarWrap}>
                  {conv.otherUserAvatar ? (
                    <img src={conv.otherUserAvatar} alt={conv.otherUserName} style={styles.avatar} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      {conv.otherUserName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span style={styles.badge}>{conv.unreadCount}</span>
                  )}
                </div>

                <div style={styles.convInfo}>
                  <span style={styles.convName}>{conv.otherUserName}</span>
                  <span style={styles.preview}>
                    {conv.lastMessage
                      ? conv.lastMessage.slice(0, 60) + (conv.lastMessage.length > 60 ? "…" : "")
                      : "No messages yet"}
                  </span>
                </div>

                {conv.lastMessageAt && (
                  <span style={styles.timestamp}>
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </Link>

              <button
                onClick={() => handleDelete(conv.conversationId)}
                style={styles.deleteBtn}
                title="Delete conversation"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Find users ── */}
      <hr style={styles.divider} />
      <h2 style={styles.subtitle}>Find Users</h2>
      <ul style={styles.usersList}>
        {users
          .filter((u) => u.userId !== dbUser?.userId)
          .map((u) => (
            <li key={u.userId} style={styles.userItem}>
              <Link to={`/users/${u.userName}`} style={styles.userLink}>
                {u.avatarUrl && (
                  <img src={u.avatarUrl} alt={u.userName} style={styles.smallAvatar} />
                )}
                <span>{u.userName}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

const styles = {
  page:  { maxWidth: 600, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title:{ margin: 0, fontSize: 26 },
  homeLink: { color: "#555", textDecoration: "none", fontSize: 14 },
  error:{ color: "red" },
  empty:  { color: "#888" },
  list:  { listStyle: "none", padding: 0, margin: 0 },
  item:  {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
    gap: 8,
  },
  convLink:  {
    display: "flex",
    alignItems: "center",
    flex: 1,
    textDecoration: "none",
    color: "inherit",
    gap: 12,
    minWidth: 0,
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: "50%",
    background: "#bbb", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 20, color: "#fff",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    background: "#e53e3e", color: "#fff",
    borderRadius: "50%", width: 18, height: 18,
    fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
  },
  convInfo:  { display: "flex", flexDirection: "column", minWidth: 0, flex: 1 },
  convName:  { fontWeight: 600, fontSize: 15, marginBottom: 2 },
  preview: { color: "#888", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  timestamp: { fontSize: 12, color: "#aaa", flexShrink: 0, marginLeft: 8 },
  deleteBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#ccc", fontSize: 16, padding: "4px 8px",
    flexShrink: 0,
  },
  divider: { margin: "32px 0 24px", borderColor: "#eee" },
  subtitle: { fontSize: 18, marginBottom: 12 },
  usersList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: 12 },
  userItem: {},
  userLink: {
    display: "flex", alignItems: "center", gap: 8,
    textDecoration: "none", color: "inherit",
    border: "1px solid #ddd", borderRadius: 8,
    padding: "8px 14px", fontSize: 14,
  },
  smallAvatar: { width: 28, height: 28, borderRadius: "50%", objectFit: "cover" },
};