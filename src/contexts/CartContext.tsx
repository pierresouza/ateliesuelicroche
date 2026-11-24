"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { SITE_CONFIG, getPixPrice } from "@/lib/constants";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

export interface CartItem {
  variantKey: string;
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  selectedColor: string;
  selectedSize: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description?: string;
}

interface AddToCartInput {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  openDrawer?: boolean;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  addToCart: (product: AddToCartInput) => void;
  removeFromCart: (variantKey: string) => void;
  updateQuantity: (variantKey: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getPixTotal: () => number;
  getFreeShippingProgress: () => { percent: number; remaining: number; unlocked: boolean };
}

const CART_STORAGE_KEY = "asc_cart_v2";
const COUPON_STORAGE_KEY = "asc_coupon_v2";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCouponState] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
      const storedCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setAppliedCouponState(JSON.parse(storedCoupon) as AppliedCoupon);
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
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, hydrated]);

  const setAppliedCoupon = (coupon: AppliedCoupon | null) => {
    setAppliedCouponState(coupon);
    try {
      if (coupon) {
        window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        window.localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const addToCart = (input: AddToCartInput) => {
    const selectedColor = input.selectedColor || "Padrão";
    const selectedSize = input.selectedSize || "Tamanho Padrão";
    const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const variantKey = `${input.slug}::${selectedColor}::${selectedSize}`;

    trackAddToCart({
      item_id: input.slug,
      item_name: input.name,
      item_category: input.category,
      item_variant: `${selectedColor} - ${selectedSize}`,
      price: input.price,
      quantity: qty,
    });

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.variantKey === variantKey);
      if (existing) {
        toast({
          title: "Sacola atualizada!",
          description: `${input.name} (${selectedColor}) teve a quantidade aumentada.`,
        });
        return currentItems.map((item) => (item.variantKey === variantKey ? { ...item, quantity: item.quantity + qty } : item));
      }

      toast({
        title: "Adicionado à sua sacola!",
        description: `${input.name} • Cor ${selectedColor}`,
      });
      return [
        ...currentItems,
        {
          variantKey,
          id: input.id,
          slug: input.slug,
          name: input.name,
          price: input.price,
          image: input.image,
          quantity: qty,
          category: input.category,
          selectedColor,
          selectedSize,
        },
      ];
    });

    if (input.openDrawer !== false) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (variantKey: string) => {
    setItems((currentItems) => {
      const target = currentItems.find((i) => i.variantKey === variantKey);
      if (target) {
        trackRemoveFromCart({
          item_id: target.slug,
          item_name: target.name,
          item_category: target.category,
          item_variant: `${target.selectedColor} - ${target.selectedSize}`,
          price: target.price,
          quantity: target.quantity,
        });
      }
      return currentItems.filter((item) => item.variantKey !== variantKey);
    });
  };

  const updateQuantity = (variantKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantKey);
      return;
    }
    setItems((currentItems) => currentItems.map((item) => (item.variantKey === variantKey ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

  const getSubtotal = () => Number(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));

  const getPixTotal = () => {
    const subtotal = getSubtotal();
    const afterCoupon = Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0));
    return getPixPrice(afterCoupon);
  };

  const getFreeShippingProgress = () => {
    const subtotal = getSubtotal();
    const threshold = SITE_CONFIG.freeShippingThreshold;
    const remaining = Math.max(0, Number((threshold - subtotal).toFixed(2)));
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
    return {
      percent,
      remaining,
      unlocked: subtotal >= threshold && subtotal > 0,
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        getPixTotal,
        getFreeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
