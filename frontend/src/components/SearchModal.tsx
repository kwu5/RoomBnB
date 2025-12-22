import { useState } from 'react'
import type { PropertySearchParams } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (params: PropertySearchParams) => void
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    city: '',
    country: '',
    guests: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty values
    const filteredParams: PropertySearchParams = {}
    if (searchParams.city) filteredParams.city = searchParams.city
    if (searchParams.country) filteredParams.country = searchParams.country
    if (searchParams.guests) filteredParams.guests = searchParams.guests
    if (searchParams.minPrice) filteredParams.minPrice = searchParams.minPrice
    if (searchParams.maxPrice) filteredParams.maxPrice = searchParams.maxPrice
    if (searchParams.bedrooms) filteredParams.bedrooms = searchParams.bedrooms

    onSearch(filteredParams)
    onClose()
  }

  const handleReset = () => {
    setSearchParams({
      city: '',
      country: '',
      guests: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
    })
    onSearch({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Search Properties</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={searchParams.city || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                    placeholder="e.g., New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={searchParams.country || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
                    placeholder="e.g., USA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Guests and Bedrooms */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <input
                    type="number"
                    value={searchParams.guests || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Number of guests"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={searchParams.bedrooms || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Minimum bedrooms"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Price per Night</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    value={searchParams.minPrice || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Min price"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={searchParams.maxPrice || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Max price"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Clear All
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#FF385C] text-white rounded-lg font-semibold hover:bg-[#E31C5F] transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
