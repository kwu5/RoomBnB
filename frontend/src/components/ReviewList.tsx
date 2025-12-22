import type { Review } from '@/types'
import ReviewItem from './ReviewItem'

interface ReviewListProps {
  reviews: Review[]
  averageRating?: number | null
  reviewCount?: number
}

export default function ReviewList({
  reviews,
  averageRating,
  reviewCount,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600">
          Be the first to review this property after your stay!
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with rating summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-[#FF385C] fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-2xl font-semibold">
            {averageRating?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-gray-600">
            · {reviewCount || reviews.length}{' '}
            {(reviewCount || reviews.length) === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-0">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
