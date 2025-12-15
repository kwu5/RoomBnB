/**
 * Format currency with proper formatting
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format date range
 */
export const formatDateRange = (checkIn: string | Date, checkOut: string | Date): string => {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut

  const checkInFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(checkInDate)

  const checkOutFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(checkOutDate)

  return `${checkInFormatted} - ${checkOutFormatted}`
}

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (checkIn: string | Date, checkOut: string | Date): number => {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut

  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Truncate text to specified length
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Format rating to 1 decimal place
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}
