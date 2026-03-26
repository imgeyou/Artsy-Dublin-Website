import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EventDetailPage from './pages/eventDetailPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/events/:eventId" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
