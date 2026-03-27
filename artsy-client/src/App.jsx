import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EventDetailPage from './pages/eventDetailPage'
import EventDetailPage from './pages/postDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
