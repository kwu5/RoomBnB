import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { formatCurrency, formatRating } from '@/utils'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    images,
    city,
    country,
    pricePerNight,
    rating,
    reviewCount,
  } = property

  return (
    <Link to={`/properties/${id}`} className="group cursor-pointer">
      <div className="space-y-3">
        {/* Image */}
        <div className="aspect-square relative overflow-hidden rounded-xl">
          <img
            src={images[0] || 'https://via.placeholder.com/400'}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          />

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              // TODO: Add to favorites functionality
            }}
            className="absolute top-3 right-3 p-2 hover:scale-110 transition"
          >
            <svg
              className="w-6 h-6 fill-none stroke-white hover:fill-white drop-shadow-lg"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* Rating Badge */}
          {rating && (
            <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
              <svg className="w-4 h-4 text-[#FF385C]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold">{formatRating(rating)}</span>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">
              {city}, {country}
            </h3>
          </div>

          <p className="text-gray-500 text-sm truncate">{title}</p>

          {reviewCount && (
            <p className="text-gray-500 text-sm">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          )}

          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-gray-900">
              {formatCurrency(pricePerNight)}
            </span>
            <span className="text-gray-500 text-sm">night</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
