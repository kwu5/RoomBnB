import type { Review } from '@/types'
import { formatDate, getInitials } from '@/utils'

interface ReviewItemProps {
  review: Review
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const { rating, comment, user, createdAt } = review

  // Generate filled stars based on rating
  const stars = Array.from({ length: 5 }, (_, index) => index < rating)

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user
                ? getInitials(user.firstName, user.lastName)
                : '??'}
            </span>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          {/* Reviewer Name */}
          <h4 className="font-semibold text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Anonymous'}
          </h4>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-1 mb-2">
            {stars.map((filled, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${
                  filled ? 'text-[#FF385C] fill-current' : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1">
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Comment */}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {comment}
          </p>
        </div>
      </div>
    </div>
  )
}
