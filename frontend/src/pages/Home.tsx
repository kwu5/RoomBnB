import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Categories from '@/components/Categories'
import PropertyCard from '@/components/PropertyCard'
import { propertyService } from '@/services'
import type { Property } from '@/types'

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchProperties()
  }, [selectedCategory])

  const fetchProperties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await propertyService.getProperties({
        // TODO: Filter by category when backend supports it
      })
      setProperties(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load properties')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <main className="pt-8 px-4 sm:px-6 lg:px-20 max-w-[2520px] mx-auto pb-20">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
              <p className="font-semibold">Error loading properties</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchProperties}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && properties.length === 0 && (
            <div className="text-center py-20">
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more results.
              </p>
            </div>
          )}

          {/* Properties Grid */}
          {!isLoading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
