// real-time one-to-one conversation
// fetches the message history via REST (also marks messages as read), then emits mark_read via socket so the other user inbox badge clears
// New messages arrive via the new_message socket event
// Sending a message emits send_message via socket -> the server saves it to db and echoes it back to both participants through private rooms

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/pages/messaging.css";

export default function Chat() {
  const { conversationId } = useParams();
  const convId = parseInt(conversationId, 10);
  const { dbUser, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);

  const bottomRef = useRef(null);

  // Fetch message history and mark the conversation as read
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/ad-messages/conversations/${convId}`, {
        credentials: "include",
      });
      if (res.status === 403) throw new Error("You are not part of this conversation");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      console.log(data);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [convId]);

  // Fetch the other participant's info to show their name in the header
  const loadOtherUser = useCallback(async () => {
    try {
      const res = await fetch("/ad-messages/conversations", { credentials: "include" });
      if (!res.ok) return;
      const convs = await res.json();
      const conv = convs.find((c) => c.conversationId === convId);
      if (conv) setOtherUser({ userName: conv.otherUserName, avatarUrl: conv.otherUserAvatar, userId: conv.otherUserId });
    } catch {
      // header info is nice to have. a failure here does not affect messaging
    }
  }, [convId]);

  useEffect(() => {
    if (firebaseUser === null) navigate("/login");
  }, [firebaseUser, navigate]);

  useEffect(() => {
    if (!firebaseUser) return;
    loadMessages();
    loadOtherUser();
  }, [firebaseUser, loadMessages, loadOtherUser]);

  // Tell the server and other user that messages are read
  useEffect(() => {
    if (!dbUser) return;
    socket.emit("mark_read", { conversationId: convId });
  }, [convId, dbUser]);

  // Listen for incoming messages in real time
  useEffect(() => {
    function onNewMessage(msg) {
      if (msg.conversationId !== convId) return;
      setMessages((prev) => {
        const alreadyPresent = prev.some((m) => m.messageId === msg.messageId);
        if (alreadyPresent) return prev;
        return [...prev, msg];
      });
      // Mark as read since this chat is open
      socket.emit("mark_read", { conversationId: convId });
    }

    function onMessageError({ message }) {
      setSendError(message);
    }

    socket.on("new_message", onNewMessage);
    socket.on("message_error", onMessageError);
    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_error", onMessageError);
    };
  }, [convId]);

  // Scroll to the latest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket once user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;
    socket.on("connect", () => console.log("socket connected:", socket.id));
    socket.on("connect_error", (err) => console.log("socket connect_error:", err.message));
    socket.on("disconnect", (reason) => console.log("socket disconnected:", reason));
    if (!socket.connected) socket.connect();
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [firebaseUser]);

  function handleSend(e) {
    e.preventDefault();
    setSendError(null);
    const text = inputText.trim();
    //console.log("get the send text");
    if (!text) return;
    if (text.length > 2000) {
      setSendError("Message too long (max 2000 characters)");
      return;
    }
    //console.log("socket connected?", socket.connected, "convId:", convId);
    socket.emit("send_message", { conversationId: convId, content: text });
    setInputText("");
  }

  if (firebaseUser === undefined) return <><div className="home-header-overlay"><Header /></div><div className="chat-outer"><div className="chat-page"><p className="chat-hint">Loading…</p></div></div></>;
  if (firebaseUser === null) return null;
  if (error) return <><div className="home-header-overlay"><Header /></div><div className="chat-outer"><div className="chat-page"><p className="chat-error-state">{error}</p></div></div></>;

  return (
    <>
      <div className="home-header-overlay"><Header /></div>
      <div className="chat-outer">
      <div className="chat-page">

      {/* Header */}
      <div className="chat-header">
        <Link to="/messages" className="chat-back-link">← Inbox</Link>
        {otherUser && (
          <Link to={`/users/${otherUser.userName}`} className="chat-other-user-link">
            {otherUser.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt={otherUser.userName} className="chat-header-avatar" />
            ) : (
              <div className="chat-header-placeholder">
                {otherUser.userName?.[0]?.toUpperCase()}
              </div>
            )}
            <span>{otherUser.userName}</span>
          </Link>
        )}
      </div>

      {/* Message list */}
      <div className="chat-messages">
        {loading && <p className="chat-hint">Loading messages…</p>}
        {!loading && messages.length === 0 && ( <p className="chat-hint">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === dbUser?.userId;
          return (
            <div
              key={msg.messageId ?? `${msg.senderId}-${msg.createdAt}`}
              className={`bubble ${isMine ? "bubble--mine" : "bubble--theirs"}`}
            >
              <p className="bubble-text">{msg.content}</p>
              <span className="bubble-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-form-wrap">
        {sendError && <p className="chat-send-error">{sendError}</p>}
        <form onSubmit={handleSend} className="chat-form-inner">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message…" className="chat-input" maxLength={2000}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>Send</button>
        </form>
      </div>

      </div>
      <Footer />
      </div>
    </>
  );

}
