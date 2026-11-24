"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { trackAddToWishlist } from "@/lib/analytics";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isFavorite: (slug: string) => boolean;
}

const WISHLIST_STORAGE_KEY = "asc_wishlist_v1";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved) as WishlistItem[]);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, hydrated]);

  const toggleWishlist = (product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === product.slug);
      if (exists) {
        toast({
          title: "Removido dos favoritos",
          description: `${product.name} foi removido da sua lista.`,
        });
        return prev.filter((i) => i.slug !== product.slug);
      }

      trackAddToWishlist({
        item_id: product.slug,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      });
      toast({
        title: "Salvo nos seus Favoritos!",
        description: `${product.name} foi guardado para você.`,
      });
      return [...prev, product];
    });
  };

  const isFavorite = (slug: string) => items.some((i) => i.slug === slug);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isWishlistOpen,
        setIsWishlistOpen,
        toggleWishlist,
        isFavorite,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
};
