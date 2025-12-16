import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import PropertyDetail from '@/pages/PropertyDetail'
import MyBookings from '@/pages/MyBookings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/my-bookings" element={<MyBookings />} />
    </Routes>
  )
}

export default App
