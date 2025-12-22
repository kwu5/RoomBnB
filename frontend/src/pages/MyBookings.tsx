import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { bookingService } from '@/services'
import { useAuth } from '@/store'
import type { Booking } from '@/types'
import { formatCurrency, formatDateRange, calculateNights } from '@/utils'

type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled'

export default function MyBookings() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [isAuthenticated, navigate])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await bookingService.getGuestBookings()
      setBookings(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setCancellingId(bookingId)
    try {
      await bookingService.cancelBooking(bookingId)
      await fetchBookings()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    )
  }

  const filterBookings = () => {
    const now = new Date()

    switch (filter) {
      case 'upcoming':
        return bookings.filter(
          (b) => new Date(b.checkIn) > now && b.status !== 'CANCELLED'
        )
      case 'past':
        return bookings.filter(
          (b) => new Date(b.checkOut) < now && b.status !== 'CANCELLED'
        )
      case 'cancelled':
        return bookings.filter((b) => b.status === 'CANCELLED')
      default:
        return bookings
    }
  }

  const filteredBookings = filterBookings()

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
            <p className="font-semibold">Error loading bookings</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-600">View and manage your bookings</p>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Bookings' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as BookingFilter)}
              className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${
                filter === f.key
                  ? 'bg-[#FF385C] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : `No ${filter} bookings`}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const nights = calculateNights(
                booking.checkIn.toString(),
                booking.checkOut.toString()
              )
              const total = booking.totalPrice || 0

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={booking.property?.images[0] || 'https://via.placeholder.com/400'}
                        alt={booking.property?.title || 'Property'}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => navigate(`/properties/${booking.property?.id}`)}
                      />
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3
                            className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#FF385C]"
                            onClick={() => navigate(`/properties/${booking.property?.id}`)}
                          >
                            {booking.property?.title || 'N/A'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {booking.property?.city}, {booking.property?.country}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check-in / Check-out</p>
                          <p className="font-medium text-gray-900">
                            {formatDateRange(
                              booking.checkIn.toString(),
                              booking.checkOut.toString()
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{nights} nights</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Guests</p>
                          <p className="font-medium text-gray-900">
                            {booking.numberOfGuests}{' '}
                            {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Price</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(total)}
                          </p>
                        </div>

                        {booking.specialRequests && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                            <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                          </div>
                        )}
                      </div>

                      {booking.status !== 'CANCELLED' && new Date(booking.checkIn) > new Date() && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                          <button
                            onClick={() => navigate(`/properties/${booking.property?.id}`)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                          >
                            View Property
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
