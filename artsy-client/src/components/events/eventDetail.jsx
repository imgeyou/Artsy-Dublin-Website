import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../../services/eventService';
import {
    getPostsByEvent,
    logAttendance,
    deleteAttendance,
    updateRating,
    likeToggle,
} from '../../services/postService';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState(null); // { eventAttendId, rating } or null
  const [posts, setPosts] = useState([]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendedAt, setAttendedAt] = useState(defaultDatetime());
  const [selectedRating, setSelectedRating] = useState(0);
  const [actionMsg, setActionMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { message, resolve }

  useEffect(() => {
    getEventById(eventId)
      .then(data => {
        setEvent(data);
        if (data.attendance?.eventAttendId) {
          setAttendance(data.attendance);
          setSelectedRating(data.attendance.rating ?? 0);
        }
      })
      .catch(() => setActionMsg('Failed to load event.'));

    getPostsByEvent(eventId)
      .then(setPosts)
      .catch(() => {});
  }, [eventId]);

  function defaultDatetime() {
    const now = new Date();
    return new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  async function handleLogAttendance() {
    if (!attendedAt) { setActionMsg('Please select a date and time.'); return; }
    const formatted = attendedAt.replace('T', ' ') + ':00';
    try {
      const data = await logAttendance(eventId, formatted);
      setAttendance({ eventAttendId: data.eventAttendId, rating: null });
      setShowAttendanceForm(false);
      setActionMsg('');
    } catch {
      setActionMsg('Failed to log attendance.');
    }
  }

  async function handleDeleteAttendance() {
    const ok = await inlineConfirm('Delete attendance? All related reviews will also be deleted.');
    if (!ok) return;
    try {
      await deleteAttendance(attendance.eventAttendId);
      setAttendance(null);
      setSelectedRating(0);
      setActionMsg('');
    } catch {
      setActionMsg('Failed to delete attendance.');
    }
  }

  async function handleSubmitRating() {
    if (!selectedRating) { setActionMsg('Please select a rating first.'); return; }
    try {
      await updateRating(attendance.eventAttendId, selectedRating);
      setAttendance(prev => ({ ...prev, rating: selectedRating }));
      setActionMsg('Rating submitted!');
    } catch {
      setActionMsg('Failed to submit rating.');
    }
  }

  async function handleLike(postId) {
    try {
      const { liked } = await likeToggle(postId);
      setPosts(prev =>
        prev.map(p =>
          p.postId === postId
            ? { ...p, likeCount: (p.likeCount ?? 0) + (liked ? 1 : -1) }
            : p
        )
      );
    } catch { /* silently fail */ }
  }

  function inlineConfirm(message) {
    return new Promise(resolve => setConfirmModal({ message, resolve }));
  }

  function resolveConfirm(answer) {
    confirmModal?.resolve(answer);
    setConfirmModal(null);
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h1>Event Detail</h1>

      <div className="event-card">
        <h3>{event.title}</h3>
        <img src={event.posterUrl} alt="event poster" />
        <p>{event.createdAt}</p>
        <p>{event.description}</p>

        {/* Attendance actions */}
        {!attendance ? (
          <>
            {!showAttendanceForm ? (
              <button onClick={() => setShowAttendanceForm(true)}>Log Attendance</button>
            ) : (
              <div>
                <label style={{ fontSize: '0.88rem' }}>When did you attend?</label><br />
                <input
                  type="datetime-local"
                  value={attendedAt}
                  onChange={e => setAttendedAt(e.target.value)}
                  style={{ margin: '6px 0', fontSize: '0.88rem' }}
                />
                <br />
                <button onClick={handleLogAttendance}>Confirm</button>
                <button onClick={() => setShowAttendanceForm(false)}>Cancel</button>
              </div>
            )}
          </>
        ) : (
          <div>
            <button disabled>Attended</button>
            <button onClick={handleDeleteAttendance}>Delete Attendance</button>

            <div>
              <p>Your rating: {attendance.rating ?? 'Not rated yet'}</p>
              <div>
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className={`star${selectedRating >= n ? ' active' : ''}`}
                    onClick={() => setSelectedRating(n)}
                    style={{ fontSize: '2rem', cursor: 'pointer', color: selectedRating >= n ? 'gold' : 'gray' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button onClick={handleSubmitRating}>Submit Rating</button>
            </div>

            <br />
            <button onClick={() => navigate(`/events/${eventId}/create-post`)}>
              Write a Review
            </button>
          </div>
        )}

        <p>{actionMsg}</p>
      </div>

      {/* Reviews section */}
      <div>
        <h3>Reviews</h3>
        {posts.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          posts.map(post => {
            const preview = post.content.length > 120
              ? post.content.slice(0, 120) + '…'
              : post.content;
            const stars = post.rating
              ? '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating)
              : '';

            return (
              <div key={post.postId} className="review-card">
                <div className="review-header">
                  <span className="review-author">{post.username}</span>
                  <span className="review-meta">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {stars && <div className="review-stars">{stars}</div>}
                <span
                  className="review-content"
                  onClick={() => navigate(`/posts/${post.postId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {preview}
                </span>
                <div className="review-footer">
                  <span
                    className="comment-btn"
                    onClick={() => navigate(`/posts/${post.postId}#comments`)}
                    style={{ cursor: 'pointer' }}
                  >
                    💬 {post.commentCount ?? 0}
                  </span>
                  <button className="like-btn" onClick={() => handleLike(post.postId)}>
                    ♡ {post.likeCount ?? 0}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inline confirm modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '320px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px' }}>{confirmModal.message}</p>
            <button onClick={() => resolveConfirm(true)}>Delete</button>
            <button onClick={() => resolveConfirm(false)} style={{ marginLeft: '8px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
