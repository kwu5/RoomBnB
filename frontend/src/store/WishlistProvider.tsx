import { useState, useEffect, type ReactNode } from "react";
import { wishlistService } from "@/services";
import { useAuth } from "./AuthContext";
import { WishlistContext, type WishlistContextType } from "./WishlistContext";

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const properties = await wishlistService.getWishlist();
      const ids = new Set(properties.map((p) => p.id));
      setWishlistIds(ids);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (propertyId: string) => {
    if (!isAuthenticated) return;

    try {
      await wishlistService.addToWishlist(propertyId);
      setWishlistIds((prev) => new Set([...prev, propertyId]));
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    if (!isAuthenticated) return;

    try {
      await wishlistService.removeFromWishlist(propertyId);
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error;
    }
  };

  const isInWishlist = (propertyId: string): boolean => {
    return wishlistIds.has(propertyId);
  };

  const value: WishlistContextType = {
    wishlistIds,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
