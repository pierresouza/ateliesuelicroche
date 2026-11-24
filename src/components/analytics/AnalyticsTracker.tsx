"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureUtmParams, trackPageView } from "@/lib/analytics";

function RouteObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      captureUtmParams(new URLSearchParams(searchParams.toString()));
    }
    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <RouteObserver />
    </Suspense>
  );
}
