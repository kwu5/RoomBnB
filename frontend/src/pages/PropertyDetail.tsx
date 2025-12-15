import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { propertyService } from '@/services'
import { useAuth } from '@/store'
import type { Property } from '@/types'
import { formatCurrency, formatRating, calculateNights } from '@/utils'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    if (id) {
      fetchProperty(id)
    }
  }, [id])

  const fetchProperty = async (propertyId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await propertyService.getPropertyById(propertyId)
      setProperty(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load property')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    // TODO: Implement booking functionality
    console.log('Book:', { checkIn, checkOut, guests })
  }

  const calculateTotal = () => {
    if (!property || !checkIn || !checkOut) return 0
    const nights = calculateNights(checkIn, checkOut)
    return nights * property.pricePerNight + property.cleaningFee
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error loading property</p>
            <p className="text-sm mt-1">{error || 'Property not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Go back home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            {property.rating && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#FF385C]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{formatRating(property.rating)}</span>
                {property.reviewCount && (
                  <span className="text-gray-600">
                    ({property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}
            <span className="text-gray-600">
              {property.city}, {property.country}
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden max-h-[500px]">
          <div className="col-span-4 md:col-span-2 md:row-span-2">
            <img
              src={property.images[0] || 'https://via.placeholder.com/800'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {property.images.slice(1, 5).map((image, index) => (
            <div key={index} className="col-span-2 md:col-span-1 h-[250px]">
              <img
                src={image || 'https://via.placeholder.com/400'}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">
                Hosted by {property.host?.firstName || 'Host'}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{property.maxGuests} guests</span>
                <span>·</span>
                <span>{property.bedrooms} bedrooms</span>
                <span>·</span>
                <span>{property.bathrooms} bathrooms</span>
              </div>
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">About this place</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-gray-300 rounded-xl shadow-lg p-6">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-semibold">
                  {formatCurrency(property.pricePerNight)}
                </span>
                <span className="text-gray-600">night</span>
              </div>

              {/* Booking Form */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-lg overflow-hidden">
                  <div className="p-3 border-r border-gray-300">
                    <label className="text-xs font-semibold uppercase">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-sm outline-none"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-semibold uppercase">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-3">
                  <label className="text-xs font-semibold uppercase block mb-2">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full text-sm outline-none"
                  >
                    {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!checkIn || !checkOut}
                className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isAuthenticated ? 'Reserve' : 'Log in to book'}
              </button>

              {checkIn && checkOut && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="underline">
                      {formatCurrency(property.pricePerNight)} x {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span>{formatCurrency(nights * property.pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="underline">Cleaning fee</span>
                    <span>{formatCurrency(property.cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
