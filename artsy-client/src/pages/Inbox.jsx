// Inbox shows all conversations for the logged-in user, newest convos come first
// Each row shows the other user's name/avatar, last message preview, unread badge, delete button
// 'Find Users' section at the bottom lists all registered users so user can navigate to their profile and start chatting

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import "../styles/pages/messaging.css";

export default function Inbox() {
  const { dbUser, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetch("/ad-messages/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
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

  },
  []);

  useEffect(() => {
    if (firebaseUser === null) navigate("/login");
  }, [firebaseUser, navigate]);

  useEffect(() => {
    if (!firebaseUser) return;
    loadInbox();
    loadUsers();
  }, [firebaseUser, loadInbox, loadUsers]);

  // Update inbox preview in real time when a new message arrives
  useEffect(() => {
    function onNewMessage(msg) {
      setConversations((prev) => {
        const existing = prev.find((c) => c.conversationId === msg.conversationId);
        if (existing) {
          const updated = {...existing, lastMessage: msg.content, lastMessageAt: msg.createdAt,
            unreadCount:
              msg.senderId !== dbUser?.userId
                ? (existing.unreadCount || 0)+ 1
                : existing.unreadCount,
          };

          return [updated, ...prev.filter((c) => c.conversationId !== msg.conversationId)];
        }
        // New conversation not yet in the list ->then reload full inbox
        loadInbox();
        return prev;
      });
    }
    socket.on("new_message", onNewMessage);
    return () => socket.off("new_message", onNewMessage);
  }, [dbUser, loadInbox]);

  async function handleDelete(conversationId) {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    try {
      const res = await fetch(`/ad-messages/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Could not delete conversation");
      setConversations((prev) => prev.filter((c) => c.conversationId !== conversationId));
    } catch (err) {
      alert(err.message);
    }
  }

  if (firebaseUser === undefined || firebaseUser === null) return <div className="msg-page"><p style={{ padding: 48 }}>Loading…</p></div>;

  return (
    <div className="msg-page">
      <div className="inbox-wrap">

        <div className="inbox-header">
          <h1 className="inbox-title">Messages</h1>
          <Link to="/" className="inbox-home-link"> Go Home</Link>
        </div>

        {error && <p className="inbox-error">{error}</p>}

        {loading ? (
          <p className="inbox-empty">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="inbox-empty">No conversations yet. Find a user below to start chatting.</p>
        ) : (
          <ul className="conv-list">
            {conversations.map((conv)  => (
              <li key={conv.conversationId} className="conv-item">
                <Link to={`/messages/${conv.conversationId}`} className="conv-link">
                  <div className="conv-avatar-wrap">
                    {conv.otherUserAvatar ? (
                      <img src={conv.otherUserAvatar} alt={conv.otherUserName} className="conv-avatar" />
                    ): (
                      <div className="conv-avatar-placeholder">
                        {conv.otherUserName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && ( <span className="conv-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>

                  <div className="conv-info">
                    <span className={`conv-name${conv.unreadCount >0 ? " conv-name--unread" : ""}`}>{conv.otherUserName}</span>
                    <span className={`conv-preview${conv.unreadCount > 0 ? " conv-preview--unread" : ""}`}>
                      {conv.lastMessage
                        ? conv.lastMessage.slice(0, 60) + (conv.lastMessage.length > 60 ? "…" : "")
                        : "No messages yet"}
                    </span>
                  </div>

                  {conv.lastMessageAt && (
                    <span className="conv-timestamp">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </Link>

                <button onClick={() => handleDelete(conv.conversationId)} className="conv-delete-btn" title="Delete conversation">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <hr className="inbox-divider"/>
        <h2 className="inbox-section-title">Find Users</h2>

        <div className="users-grid">
          {users .filter((u) => u.userId !== dbUser?.userId)
            .map((u) => (
              <Link key={u.userId} to={`/users/${u.userName}`} className="user-pill-link">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl}alt={u.userName} className="user-pill-avatar" />
                ): (
                  <div className="user-pill-placeholder">
                    {u.userName?.[0]?.toUpperCase()}
                  </div>
                )}

                <span> {u.userName}</span>
              </Link>
            ))}
        </div>

      </div>
    </div>
  );

}
