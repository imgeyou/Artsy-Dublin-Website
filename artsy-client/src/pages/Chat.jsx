// real-time one-to-one conversation 
// fetches the message history via REST (also marks messages as read), then emits mark_read via socket so the other user inbox badge clears
// New message arrive via the new_message socket event 
// Sending a message emits send_message via socket ->>the server saves it to db and echoes it back to both participants through private rooms

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";

export default function Chat() {
  const { conversationId } = useParams() ;
  const convId = parseInt(conversationId, 10);
  const { dbUser, firebaseUser } = useAuth();
  const navigate  = useNavigate();

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
     const res = await fetch(`/messages/conversations/${convId}`, {
       credentials: "include",
      });

     if (res.status === 403) throw new Error("You are not part of this conversation");

     if (!res.ok) throw new Error("Failed to load messages");

     const data = await res.json();

     setMessages(data);

    } catch (err) {
     setError(err.message);

    }finally {
     setLoading(false);
    }

  },   [convId]);

  //   fetch the other participant's info to show their name in the header
  const loadOtherUser = useCallback(async () => {
    try {
      const res = await fetch("/messages/conversations", { credentials: "include" });
      if (!res.ok) return;
      const convs = await res.json();
      const conv = convs.find((c) => c.conversationId === convId);
      if (conv) setOtherUser({ userName: conv.otherUserName, avatarUrl: conv.otherUserAvatar, userId: conv.otherUserId });
    } catch {
      // header info is nice to have, failure here does not affect messaging
    }
  }, [convId]);

  useEffect(() => {
   if (!firebaseUser) return;
   loadMessages();
   loadOtherUser();
  },  [firebaseUser, loadMessages, loadOtherUser]);

  // Tell the server and other user that message is read
  useEffect(() => {
   if (!dbUser) return;
   socket.emit("mark_read", { conversationId: convId });
  }, [convId,  dbUser]);

  // Listen for incoming messages in real time
 useEffect(() => {
   function onNewMessage(msg) {
     if (msg.conversationId !== convId) return;
     setMessages((prev) => {

       const alreadyPresent = prev.some((m) => m.messageId === msg.messageId);
       if (alreadyPresent) return prev;
       return [...prev, msg];
      });
      // Mark as read when chats open
     socket.emit("mark_read", { conversationId: convId });
    }

   function onMessageError({ message })   {
     setSendError(message);

    }

   socket.on("new_message", onNewMessage);
   socket.on("message_error", onMessageError);
   return () => {
     socket.off("new_message", onNewMessage);
     socket.off("message_error", onMessageError) ;
    };

  }, [convId]);

  //   to the latest message whenever list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  },  [messages]);

 function handleSend(e) {
   e.preventDefault();
   setSendError(null);
   const text = inputText.trim();
   if (!text) return;
   if (text.length > 2000) {
     setSendError("Message too long (max 2000 characters)");
     return;
   }
    socket.emit("send_message", { conversationId: convId, content: text });
   setInputText("");
  }

 if (firebaseUser === undefined) return <div style={styles.page}><p> Loading... </p> </div>;
 if (!firebaseUser)   { navigate("/login"); return null; }
 if (error) return  <div style={styles.page}> <p style={styles.error}>{error}</p> </div>;

  //fronted team -REDO please!!!!---------------------
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/messages" style={styles.back}>← Inbox</Link>
        {otherUser && (
          <Link to={`/users/${otherUser.userName}`} style={styles.otherUser}>
            {otherUser.avatarUrl && (
              <img src={otherUser.avatarUrl} alt={otherUser.userName} style={styles.headerAvatar} />
            )}
            <span>{otherUser.userName}</span>
          </Link>
        )}
      </div>

      {/* Message list */}
      <div style={styles.messageList}>
        {loading && <p style={styles.hint}>Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p style={styles.hint}>No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === dbUser?.userId;
          return (
            <div
              key={msg.messageId ?? `${msg.senderId}-${msg.createdAt}`}
              style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}
            >
              <p style={styles.bubbleText}>{msg.content}</p>
              <span style={styles.bubbleTime}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input  */}
      <form onSubmit={handleSend} style={styles.form}>
        {sendError && <p style={styles.sendError}>{sendError}</p>}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message…"
          style={styles.input}
          maxLength={2000}
        />
        <button type="submit" style={styles.sendBtn} disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: 640,
    margin: "0 auto",
    fontFamily: "sans-serif",
    background: "#fafafa",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    background: "#fff",
  },
  back:  { color: "#555", textDecoration: "none", fontSize: 14 },
  otherUser: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit", fontWeight: 600 },
  headerAvatar: { width: 36, height: 36, borderRadius: "50%", objectFit: "cover" },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  hint:  { color: "#aaa", textAlign: "center", fontSize: 14, marginTop: 24 },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 16,
    wordBreak: "break-word",
  },
  bubbleMine: {
    alignSelf: "flex-end",
    background: "#222",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: "flex-start",
    background: "#e8e8e8",
    color: "#111",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { margin: 0, fontSize: 15, lineHeight: 1.4 },
  bubbleTime: { display: "block", fontSize: 11, opacity: 0.6, marginTop: 4, textAlign: "right" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    background: "#fff",
  },
  sendError: { color: "red", fontSize: 13, margin: 0 },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 24,
    border: "1px solid #ddd",
    fontSize: 15,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 24px",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    fontSize: 15,
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  error: { color: "red", padding: 16 },
};