import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { dashboardService } from '@/services'
import type { GuestDashboard, HostDashboard } from '@/services/dashboard.service'
import { useAuth } from '@/store'
import { formatCurrency, formatDateRange } from '@/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [guestData, setGuestData] = useState<GuestDashboard | null>(null)
  const [hostData, setHostData] = useState<HostDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, user, navigate])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Always fetch guest data
      const guest = await dashboardService.getGuestDashboard()
      setGuestData(guest)

      // Fetch host data if user is a host
      if (user?.isHost) {
        const host = await dashboardService.getHostDashboard()
        setHostData(host)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        {/* Host Section */}
        {user?.isHost && hostData && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Host Dashboard</h2>
              <button
                onClick={() => navigate('/host-earnings')}
                className="text-[#FF385C] font-medium hover:underline"
              >
                View Detailed Earnings
              </button>
            </div>

            {/* Host Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(hostData.totalEarnings)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(hostData.thisMonthEarnings)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hostData.activeListings}/{hostData.totalListings}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Avg. Rating</p>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold text-gray-900">
                    {hostData.averageRating || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500">({hostData.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Pending Bookings Alert */}
            {hostData.pendingBookings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-800">
                        {hostData.pendingBookings.length} Pending Booking{hostData.pendingBookings.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-yellow-700">Review and respond to booking requests</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/host-bookings')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
                  >
                    View Requests
                  </button>
                </div>
              </div>
            )}

            {/* Pending Guest Reviews */}
            {hostData.pendingGuestReviews.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">
                        {hostData.pendingGuestReviews.length} Guest{hostData.pendingGuestReviews.length > 1 ? 's' : ''} to Review
                      </p>
                      <p className="text-sm text-blue-700">Share your experience with recent guests</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/host-bookings?filter=completed')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Review Guests
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions for Host */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/my-listings')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="font-semibold text-gray-900">My Listings</p>
                <p className="text-sm text-gray-500">Manage properties</p>
              </button>
              <button
                onClick={() => navigate('/host-bookings')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="font-semibold text-gray-900">Bookings</p>
                <p className="text-sm text-gray-500">View requests</p>
              </button>
              <button
                onClick={() => navigate('/host-earnings')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-gray-900">Earnings</p>
                <p className="text-sm text-gray-500">Track income</p>
              </button>
              <button
                onClick={() => navigate('/create-property')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="font-semibold text-gray-900">Add Listing</p>
                <p className="text-sm text-gray-500">List a property</p>
              </button>
            </div>
          </div>
        )}

        {/* Guest Section */}
        {guestData && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {user?.isHost ? 'Your Trips' : 'My Dashboard'}
            </h2>

            {/* Guest Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{guestData.totalTrips}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900">{guestData.upcomingTrips.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500 mb-1">Saved Properties</p>
                <p className="text-2xl font-bold text-gray-900">{guestData.favoriteCount}</p>
              </div>
            </div>

            {/* Pending Reviews Alert */}
            {guestData.pendingReviews.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        {guestData.pendingReviews.length} Trip{guestData.pendingReviews.length > 1 ? 's' : ''} to Review
                      </p>
                      <p className="text-sm text-green-700">Share your experience from recent stays</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                  >
                    Write Reviews
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Trips */}
            {guestData.upcomingTrips.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Trips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guestData.upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/properties/${trip.property?.id}`)}
                    >
                      <img
                        src={trip.property?.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={trip.property?.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 truncate">{trip.property?.title}</p>
                        <p className="text-sm text-gray-500">{trip.property?.city}, {trip.property?.country}</p>
                        <p className="text-sm text-[#FF385C] font-medium mt-2">
                          {formatDateRange(trip.checkIn, trip.checkOut)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions for Guest */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-semibold text-gray-900">Explore</p>
                <p className="text-sm text-gray-500">Find places</p>
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold text-gray-900">My Trips</p>
                <p className="text-sm text-gray-500">View bookings</p>
              </button>
              <button
                onClick={() => navigate('/wishlists')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="font-semibold text-gray-900">Wishlists</p>
                <p className="text-sm text-gray-500">Saved places</p>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition"
              >
                <svg className="w-8 h-8 text-[#FF385C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="font-semibold text-gray-900">Profile</p>
                <p className="text-sm text-gray-500">Account settings</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
