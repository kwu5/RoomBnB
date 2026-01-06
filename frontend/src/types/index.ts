// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  isHost: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

// Property Types
export interface Property {
  id: string
  title: string
  description: string
  pricePerNight: number
  cleaningFee: number
  bedrooms: number
  bathrooms: number
  maxGuests: number
  address: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  amenities: string[]
  propertyType: PropertyType
  images: string[]
  hostId: string
  host?: User
  rating?: number
  reviewCount?: number
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'VILLA'
  | 'CABIN'
  | 'COTTAGE'
  | 'LOFT'
  | 'TOWNHOUSE'
  | 'OTHER'

export interface PropertySearchParams {
  city?: string
  country?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  minPrice?: number
  maxPrice?: number
  propertyType?: PropertyType
  bedrooms?: number
  bathrooms?: number
  amenities?: string[]
  page?: number
  limit?: number
}

export interface PropertySearchResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Booking Types
export interface Booking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: BookingStatus
  numberOfGuests: number
  specialRequests?: string
  propertyId: string
  property?: Property
  guestId: string
  guest?: User
  review?: Review | null
  createdAt: string
  updatedAt: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'rejected'

export interface CreateBookingData {
  propertyId: string
  checkIn: string
  checkOut: string
  numberOfGuests: number
  specialRequests?: string
}

// Favorite/Wishlist Types
export interface Favorite {
  id: string
  userId: string
  propertyId: string 
  property: Property 
  creatdAt: string 
}

// Review Types
export interface Review {
  id: string
  rating: number
  comment: string
  propertyId: string
  property?: Property
  userId: string
  user?: User
  bookingId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReviewData {
  propertyId: string
  bookingId?: string
  rating: number
  comment: string
}

// Message Types
export interface Message {
  id: string
  content: string
  isRead: boolean
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  conversationId: string
  createdAt: string
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface SendMessageData {
  receiverId: string
  content: string
  conversationId?: string
}

// Payment Types
export interface PaymentIntent {
  clientSecret: string
  amount: number
  bookingId: string
}

export interface CreatePaymentIntentData {
  bookingId: string
  amount: number
}

// API Response Types
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Filter and Category Types
export interface Category {
  id: string
  name: string
  icon: string
  description?: string
}

export const PROPERTY_CATEGORIES: Category[] = [
  { id: '', name: 'All', icon: '🏠', description: 'All properties' },
  { id: 'APARTMENT', name: 'Apartments', icon: '🏢', description: 'City apartments' },
  { id: 'HOUSE', name: 'Houses', icon: '🏡', description: 'Entire houses' },
  { id: 'VILLA', name: 'Villas', icon: '🏰', description: 'Luxury villas' },
  { id: 'CABIN', name: 'Cabins', icon: '🏕️', description: 'Cozy cabins' },
  { id: 'COTTAGE', name: 'Cottages', icon: '🏘️', description: 'Charming cottages' },
  { id: 'LOFT', name: 'Lofts', icon: '🏙️', description: 'Modern lofts' },
  { id: 'TOWNHOUSE', name: 'Townhouses', icon: '🏢', description: 'Urban townhouses' },
]

export const AMENITIES = [
  'WiFi',
  'Kitchen',
  'Washer',
  'Dryer',
  'Air conditioning',
  'Heating',
  'TV',
  'Parking',
  'Pool',
  'Hot tub',
  'Gym',
  'Beach access',
  'Workspace',
  'Fireplace',
  'Pets allowed',
  'Smoking allowed',
]
