import { createContext, useContext } from 'react'

  export interface WishlistContextType {
    wishlistIds: Set<string>
    isLoading: boolean
    addToWishlist: (propertyId: string) => Promise<void>
    removeFromWishlist: (propertyId: string) => Promise<void>
    isInWishlist: (propertyId: string) => boolean
    refreshWishlist: () => Promise<void>
  }

  export const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

  export const useWishlist = () => {
    const context = useContext(WishlistContext)
    if (!context) {
      throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
  }