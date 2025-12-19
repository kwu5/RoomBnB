import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PropertyCard from '@/components/PropertyCard'
import { wishlistService } from '@/services'
import { useAuth } from '@/store'
import type { Property } from '@/types'

export default function Wishlists() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchWishlist()
  }, [isAuthenticated, navigate])

  const fetchWishlist = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await wishlistService.getWishlist()
      setProperties(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist')
    } finally {
      setIsLoading(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error loading wishlist</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchWishlist}
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-20 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Wishlists</h1>
          <p className="text-gray-600">Your saved properties</p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved properties yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring and save your favorite properties by clicking the heart icon
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
