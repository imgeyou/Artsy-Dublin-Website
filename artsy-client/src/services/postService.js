const BASE_URL = '/api/posts';

async function getPostsByEvent(eventId) {
  const res = await fetch(`${BASE_URL}/event/${eventId}`);
  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
}

async function logAttendance(eventId, attendedAt) {
  const res = await fetch(`${BASE_URL}/${eventId}/attend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attendedAt }),
  });
  if (!res.ok) throw new Error('Failed to log attendance');
  return res.json();
}

async function deleteAttendance(eventAttendId) {
  const res = await fetch(`${BASE_URL}/${eventAttendId}/attend`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete attendance');
}

async function updateRating(eventAttendId, rating) {
  const res = await fetch(`${BASE_URL}/${eventAttendId}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error('Failed to submit rating');
}

async function likeToggle(postId) {
  const res = await fetch(`${BASE_URL}/${postId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export {
  getPostsByEvent,
  logAttendance,
  deleteAttendance,
  updateRating,
  likeToggle
}
