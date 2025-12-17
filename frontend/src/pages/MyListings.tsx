import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { propertyService } from '@/services'
import { useAuth } from '@/store'
import type { Property } from '@/types'
import { formatCurrency } from '@/utils'

export default function MyListings() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!user?.isHost) {
      navigate('/')
      return
    }

    fetchListings()
  }, [isAuthenticated, user, navigate])

  const fetchListings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await propertyService.getMyProperties()
      setProperties(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (propertyId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(propertyId)
    try {
      await propertyService.deleteProperty(propertyId)
      // Refresh listings
      await fetchListings()
    } catch (err: any) {
      alert(err.message || 'Failed to delete property')
    } finally {
      setDeletingId(null)
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
            <p className="font-semibold">Error loading listings</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchListings}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your properties</p>
          </div>
          <button
            onClick={() => navigate('/create-property')}
            className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition"
          >
            + Add New Property
          </button>
        </div>

        {/* Empty State */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">
              Start earning by listing your first property
            </p>
            <button
              onClick={() => navigate('/create-property')}
              className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          /* Properties Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Property Image */}
                <div
                  className="relative h-48 cursor-pointer"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <img
                    src={property.images[0] || 'https://via.placeholder.com/400'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.isActive ? (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-lg text-gray-900 mb-1 cursor-pointer hover:text-[#FF385C] line-clamp-1"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {property.city}, {property.country}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{property.bedrooms} beds</span>
                    <span>·</span>
                    <span>{property.bathrooms} baths</span>
                    <span>·</span>
                    <span>{property.maxGuests} guests</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-semibold text-gray-900">
                      {formatCurrency(property.pricePerNight)}
                    </span>
                    <span className="text-gray-600 text-sm">/ night</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="flex-1 px-4 py-2 border border-[#FF385C] text-[#FF385C] rounded-lg font-medium hover:bg-red-50 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id, property.title)}
                      disabled={deletingId === property.id}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition text-sm disabled:opacity-50"
                    >
                      {deletingId === property.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
