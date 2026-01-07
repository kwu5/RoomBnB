import GuestReviewForm from './GuestReviewForm'

interface GuestReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  guestId: string
  guestName: string
  propertyTitle: string
  onSuccess?: () => void
}

export default function GuestReviewModal({
  isOpen,
  onClose,
  bookingId,
  guestId,
  guestName,
  propertyTitle,
  onSuccess,
}: GuestReviewModalProps) {
  if (!isOpen) return null

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    // Close modal after a short delay to show success message
    setTimeout(() => {
      onClose()
    }, 1500)
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
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Review Guest</h2>
              <p className="text-sm text-gray-600 mt-1">
                {guestName} stayed at {propertyTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Guest Review Form */}
          <GuestReviewForm
            bookingId={bookingId}
            guestId={guestId}
            guestName={guestName}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  )
}
