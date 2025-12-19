import { useState } from 'react'
import { reviewService } from '@/services'
import type { CreateReviewData } from '@/types'

interface ReviewFormProps {
  propertyId: string
  bookingId: string
  onSuccess?: () => void
}

export default function ReviewForm({
  propertyId,
  bookingId,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (rating < 1 || rating > 5) {
      setError('Please select a rating')
      return
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long')
      return
    }

    setIsSubmitting(true)

    try {
      const data: CreateReviewData = {
        propertyId,
        bookingId,
        rating,
        comment: comment.trim(),
      }

      await reviewService.createReview(data)
      setSuccess(true)
      setComment('')
      setRating(5)

      // Call onSuccess callback after short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <svg
          className="w-12 h-12 mx-auto text-green-500 mb-3"
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
        <h3 className="text-lg font-semibold text-green-900 mb-1">
          Review Submitted!
        </h3>
        <p className="text-green-700">
          Thank you for sharing your experience.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-[#FF385C] fill-current'
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-none"
            placeholder="Share your experience with this property..."
            required
            minLength={10}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum 10 characters ({comment.length}/10)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || comment.trim().length < 10}
          className="w-full bg-[#FF385C] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E31C5F] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  )
}
