const BASE_URL = '/api/events';

async function getEventById(eventId) {
  const res = await fetch(`${BASE_URL}/${eventId}`);
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}

export {getEventById}
