/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

/**
 * Validate date is not in the past
 */
export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dateObj >= today
}

/**
 * Validate check-out date is after check-in date
 */
export const isCheckOutAfterCheckIn = (checkIn: string | Date, checkOut: string | Date): boolean => {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut
  return checkOutDate > checkInDate
}

/**
 * Validate price is positive
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && !isNaN(price)
}

/**
 * Validate number of guests
 */
export const isValidGuestCount = (guests: number, maxGuests: number): boolean => {
  return guests > 0 && guests <= maxGuests && !isNaN(guests)
}
