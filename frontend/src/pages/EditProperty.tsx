import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { propertyService } from '@/services'
import { useAuth } from '@/store'
import type { Property, PropertyType } from '@/types'
import { AMENITIES } from '@/types'

export default function EditProperty() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [property, setProperty] = useState<Property | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerNight: '',
    cleaningFee: '',
    bedrooms: '1',
    bathrooms: '1',
    maxGuests: '1',
    address: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    propertyType: 'APARTMENT',
    amenities: [] as string[],
    images: [''],
  })

  // Check authentication and load property
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!user?.isHost) {
      navigate('/')
      return
    }

    if (id) {
      loadProperty(id)
    }
  }, [isAuthenticated, user, id, navigate])

  const loadProperty = async (propertyId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await propertyService.getPropertyById(propertyId)

      // Check if user owns this property
      if (data.hostId !== user?.id) {
        setError('You do not have permission to edit this property')
        return
      }

      setProperty(data)

      // Pre-fill form with existing data
      setFormData({
        title: data.title,
        description: data.description,
        pricePerNight: data.pricePerNight.toString(),
        cleaningFee: data.cleaningFee?.toString() || '',
        bedrooms: data.bedrooms.toString(),
        bathrooms: data.bathrooms.toString(),
        maxGuests: data.maxGuests.toString(),
        address: data.address,
        city: data.city,
        country: data.country,
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        propertyType: data.propertyType,
        amenities: data.amenities || [],
        images: data.images.length > 0 ? data.images : [''],
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load property')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.pricePerNight || Number(formData.pricePerNight) <= 0) return 'Valid price is required'
    if (!formData.address.trim()) return 'Address is required'
    if (!formData.city.trim()) return 'City is required'
    if (!formData.country.trim()) return 'Country is required'

    const validImages = formData.images.filter(img => img.trim())
    if (validImages.length === 0) return 'At least one image URL is required'

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        pricePerNight: Number(formData.pricePerNight),
        cleaningFee: formData.cleaningFee ? Number(formData.cleaningFee) : 0,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        maxGuests: Number(formData.maxGuests),
        address: formData.address,
        city: formData.city,
        country: formData.country,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        propertyType: formData.propertyType as PropertyType,
        amenities: formData.amenities,
        images: formData.images.filter(img => img.trim()),
      }

      await propertyService.updateProperty(id, propertyData)

      // Redirect to the property page
      navigate(`/properties/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update property')
    } finally {
      setIsSaving(false)
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

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => navigate('/my-listings')}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Back to My Listings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-gray-600">Update your listing details</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CABIN">Cabin</option>
                  <option value="COTTAGE">Cottage</option>
                  <option value="LOFT">Loft</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night ($) *
                </label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaning Fee ($)
                </label>
                <input
                  type="number"
                  name="cleaningFee"
                  value={formData.cleaningFee}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="1"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests *
                </label>
                <input
                  type="number"
                  name="maxGuests"
                  value={formData.maxGuests}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-[#FF385C] border-gray-300 rounded focus:ring-[#FF385C]"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Images</h2>

            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addImageField}
                className="text-[#FF385C] text-sm font-medium hover:underline"
              >
                + Add another image
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/properties/${id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-[#FF385C] text-white rounded-lg font-semibold hover:bg-[#E31C5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
