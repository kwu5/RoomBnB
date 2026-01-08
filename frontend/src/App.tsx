import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import PropertyDetail from '@/pages/PropertyDetail'
import MyBookings from '@/pages/MyBookings'
import CreateProperty from '@/pages/CreateProperty'
import MyListings from '@/pages/MyListings'
import EditProperty from '@/pages/EditProperty'
import Profile from '@/pages/Profile'
import Wishlists from '@/pages/Wishlists'
import HostBookings from '@/pages/HostBookings'
import HostEarnings from '@/pages/HostEarnings'
import Dashboard from '@/pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/host-bookings" element={<HostBookings />} />
      <Route path="/host-earnings" element={<HostEarnings />} />
      <Route path="/create-property" element={<CreateProperty />} />
      <Route path="/edit-property/:id" element={<EditProperty />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlists" element={<Wishlists />} />
    </Routes>
  )
}

export default App
