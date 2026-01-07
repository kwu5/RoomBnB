import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import GuestReviewModal from '@/components/GuestReviewModal'
import { bookingService } from '@/services'
import { useAuth } from '@/store'
import type { Booking, BookingStatus } from '@/types'
import { formatCurrency, formatDateRange, calculateNights } from '@/utils'

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface ReviewModalState {
  isOpen: boolean
  bookingId: string
  guestId: string
  guestName: string
  propertyTitle: string
}

export default function HostBookings() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({
    isOpen: false,
    bookingId: '',
    guestId: '',
    guestName: '',
    propertyTitle: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!user?.isHost) {
      navigate('/')
      return
    }

    fetchBookings()
  }, [isAuthenticated, user, navigate])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await bookingService.getHostBookings()
      setBookings(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmBooking = async (bookingId: string) => {
    setProcessingId(bookingId)
    try {
      await bookingService.confirmBooking(bookingId)
      await fetchBookings()
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) {
      return
    }

    setProcessingId(bookingId)
    try {
      await bookingService.rejectBooking(bookingId)
      await fetchBookings()
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? The guest will be notified.')) {
      return
    }

    setProcessingId(bookingId)
    try {
      await bookingService.cancelBooking(bookingId)
      await fetchBookings()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: BookingStatus) => {
    const styles: Record<BookingStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    )
  }

  const filterBookings = () => {
    switch (filter) {
      case 'pending':
        return bookings.filter((b) => b.status === 'pending')
      case 'confirmed':
        return bookings.filter((b) => b.status === 'confirmed')
      case 'completed':
        return bookings.filter((b) => b.status === 'completed')
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected')
      default:
        return bookings
    }
  }

  const filteredBookings = filterBookings()
  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const openReviewModal = (booking: Booking) => {
    setReviewModal({
      isOpen: true,
      bookingId: booking.id,
      guestId: booking.guestId,
      guestName: `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`.trim(),
      propertyTitle: booking.property?.title || 'Property',
    })
  }

  const closeReviewModal = () => {
    setReviewModal((prev) => ({ ...prev, isOpen: false }))
  }

  const handleReviewSuccess = () => {
    fetchBookings()
  }

  const canReviewGuest = (booking: Booking): boolean => {
    // Can review if booking is completed and no guest review exists
    const isCompleted = booking.status === 'completed'
    const isPastCheckout = booking.status === 'confirmed' && new Date(booking.checkOut) < new Date()
    const hasNoReview = !booking.guestReview

    return (isCompleted || isPastCheckout) && hasNoReview
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
            <p className="font-semibold">Error loading bookings</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchBookings}
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">Booking Requests</h1>
            {pendingCount > 0 && (
              <span className="bg-[#FF385C] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-gray-600">Manage booking requests for your properties</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Bookings' },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled / Rejected' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as BookingFilter)}
              className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap flex items-center gap-2 ${
                filter === f.key
                  ? 'bg-[#FF385C] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && filter !== f.key && (
                <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs">
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
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
                ? "You haven't received any bookings yet"
                : `No ${filter} bookings`}
            </p>
            <button
              onClick={() => navigate('/my-listings')}
              className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition"
            >
              View My Listings
            </button>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const nights = calculateNights(booking.checkIn, booking.checkOut)
              const isProcessing = processingId === booking.id
              const isPending = booking.status === 'pending'
              const isConfirmed = booking.status === 'confirmed'
              const isUpcoming = new Date(booking.checkIn) > new Date()

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden ${
                    isPending ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Property Image */}
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={booking.property?.images[0] || 'https://via.placeholder.com/400'}
                        alt={booking.property?.title || 'Property'}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => navigate(`/properties/${booking.property?.id}`)}
                      />
                    </div>

                    {/* Booking Details */}
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

                      {/* Guest Info */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-semibold">
                          {booking.guest?.firstName?.[0]}{booking.guest?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.guest?.firstName} {booking.guest?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{booking.guest?.email}</p>
                        </div>
                      </div>

                      {/* Booking Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Dates</p>
                          <p className="font-medium text-gray-900">
                            {formatDateRange(booking.checkIn, booking.checkOut)}
                          </p>
                          <p className="text-sm text-gray-600">{nights} nights</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Guests</p>
                          <p className="font-medium text-gray-900">
                            {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Confirm Booking
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              disabled={isProcessing}
                              className="px-6 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isConfirmed && isUpcoming && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {isProcessing ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}

                        {canReviewGuest(booking) && (
                          <button
                            onClick={() => openReviewModal(booking)}
                            className="px-4 py-2 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Review Guest
                          </button>
                        )}

                        {booking.guestReview && (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guest Reviewed
                          </span>
                        )}

                        <button
                          onClick={() => navigate(`/properties/${booking.property?.id}`)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                          View Property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Guest Review Modal */}
      <GuestReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        bookingId={reviewModal.bookingId}
        guestId={reviewModal.guestId}
        guestName={reviewModal.guestName}
        propertyTitle={reviewModal.propertyTitle}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}
