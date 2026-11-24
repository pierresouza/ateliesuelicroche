"use client";

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  discount?: number;
}

export interface StoredUtms {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const UTM_STORAGE_KEY = "asc_utm_attribution";
export const CONSENT_STORAGE_KEY = "asc_cookie_consent_v2";

function dispatchEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function updateGoogleConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  const state = granted ? "granted" : "denied";

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // Ignore storage errors
  }

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }

  dispatchEvent("cookie_consent_updated", { consent_state: state });
}

export function captureUtmParams(searchParams: URLSearchParams) {
  if (typeof window === "undefined") return;

  const keys: Array<keyof StoredUtms> = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
  ];

  const found: StoredUtms = {};
  let hasAny = false;

  for (const key of keys) {
    const val = searchParams.get(key);
    if (val) {
      found[key] = val;
      hasAny = true;
    }
  }

  if (!hasAny && document.referrer) {
    if (document.referrer.includes("instagram.com")) {
      found.utm_source = "instagram";
      found.utm_medium = "referral";
      hasAny = true;
    } else if (document.referrer.includes("google.")) {
      found.utm_source = "google";
      found.utm_medium = "organic";
      hasAny = true;
    }
  }

  if (hasAny) {
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    } catch {
      // Ignore storage errors
    }
    dispatchEvent("session_utm_capture", { ...found });
  }
}

export function getStoredUtms(): StoredUtms {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUtms) : {};
  } catch {
    return {};
  }
}

export function trackPageView(path: string, title?: string) {
  dispatchEvent("page_view", {
    page_path: path,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
    page_location: typeof window !== "undefined" ? window.location.href : path,
    ...getStoredUtms(),
  });
}

export function trackViewItemList(listId: string, listName: string, items: AnalyticsItem[]) {
  dispatchEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items,
  });
}

export function trackSelectItem(listName: string, item: AnalyticsItem) {
  dispatchEvent("select_item", {
    item_list_name: listName,
    items: [item],
  });
}

export function trackViewItem(item: AnalyticsItem) {
  dispatchEvent("view_item", {
    currency: "BRL",
    value: item.price,
    items: [item],
  });
}

export function trackSelectVariant(productName: string, variantType: "color" | "size", value: string) {
  dispatchEvent("select_variant", {
    item_name: productName,
    variant_type: variantType,
    variant_value: value,
  });
}

export function trackAddToWishlist(item: AnalyticsItem) {
  dispatchEvent("add_to_wishlist", {
    currency: "BRL",
    value: item.price,
    items: [item],
  });
}

export function trackSearch(searchTerm: string, resultsCount: number) {
  dispatchEvent("search", {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

export function trackFilterApplied(filterType: string, filterValue: string) {
  dispatchEvent("filter_applied", {
    filter_type: filterType,
    filter_value: filterValue,
  });
}

export function trackCalculateShipping(cepPrefix: string, productSlug?: string) {
  dispatchEvent("calculate_shipping", {
    cep_prefix: cepPrefix,
    item_id: productSlug || "cart",
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  dispatchEvent("add_to_cart", {
    currency: "BRL",
    value: Number((item.price * (item.quantity || 1)).toFixed(2)),
    items: [item],
  });
}

export function trackRemoveFromCart(item: AnalyticsItem) {
  dispatchEvent("remove_from_cart", {
    currency: "BRL",
    value: Number((item.price * (item.quantity || 1)).toFixed(2)),
    items: [item],
  });
}

export function trackViewCart(value: number, items: AnalyticsItem[]) {
  dispatchEvent("view_cart", {
    currency: "BRL",
    value,
    items,
  });
}

export function trackApplyCoupon(couponCode: string, discountAmount: number) {
  dispatchEvent("apply_coupon", {
    coupon: couponCode,
    currency: "BRL",
    discount_value: discountAmount,
  });
}

export function trackBeginCheckout(value: number, items: AnalyticsItem[], coupon?: string) {
  dispatchEvent("begin_checkout", {
    currency: "BRL",
    value,
    coupon,
    items,
  });
}

export function trackAddShippingInfo(value: number, shippingTier: string, items: AnalyticsItem[]) {
  dispatchEvent("add_shipping_info", {
    currency: "BRL",
    value,
    shipping_tier: shippingTier,
    items,
  });
}

export function trackAddPaymentInfo(value: number, paymentType: string, items: AnalyticsItem[]) {
  dispatchEvent("add_payment_info", {
    currency: "BRL",
    value,
    payment_type: paymentType,
    items,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  coupon?: string;
  paymentType: string;
  items: AnalyticsItem[];
}) {
  dispatchEvent("purchase", {
    transaction_id: params.transactionId,
    currency: "BRL",
    value: params.value,
    shipping: params.shipping,
    tax: 0,
    coupon: params.coupon,
    payment_type: params.paymentType,
    items: params.items,
    ...getStoredUtms(),
  });
}

export function trackWhatsAppClick(location: string, contextLabel?: string) {
  dispatchEvent("whatsapp_click", {
    click_location: location,
    context_label: contextLabel || "",
    ...getStoredUtms(),
  });
}

export function trackInstagramClick(location: string) {
  dispatchEvent("instagram_click", {
    click_location: location,
    instagram_handle: "@atelie_sueli_croche",
  });
}

export function trackGenerateLead(source: string) {
  dispatchEvent("generate_lead", {
    lead_source: source,
    ...getStoredUtms(),
  });
}

export function trackCustomRugRequest(pieceType: string, room: string) {
  dispatchEvent("custom_rug_request", {
    piece_type: pieceType,
    room,
    ...getStoredUtms(),
  });
}

export function trackCustomerAuth(action: "login" | "sign_up" | "magic_link", method = "email") {
  dispatchEvent(action, { method });
}

export function trackOrderStatusView(orderCode: string, status: string) {
  dispatchEvent("view_order_tracking", {
    order_code: orderCode,
    order_status: status,
  });
}

export function trackCancelOrder(orderCode: string, value: number, reason?: string) {
  dispatchEvent("refund", {
    transaction_id: orderCode,
    currency: "BRL",
    value,
    cancellation_reason: reason || "customer_cancelled",
  });
  dispatchEvent("order_cancelled", {
    order_code: orderCode,
    value,
    reason: reason || "customer_cancelled",
  });
}
