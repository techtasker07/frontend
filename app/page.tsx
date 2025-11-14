"use client";

import { useEffect } from "react";
import { HeroSection } from "../components/HeroSection";
import { PropertyListings } from "../components/PropertyListings";
import { FeaturesSection } from "../components/FeaturesSection";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import { useHomeStore } from "../lib/stores/home-store";

export default function App() {
  const { forceRefresh } = useHomeStore();

  useEffect(() => {
    // Check if this is a page refresh (not navigation)
    const isRefresh = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const wasRefreshed = isRefresh?.type === 'reload' ||
                        (typeof window !== 'undefined' && window.performance?.navigation?.type === 1);

    if (wasRefreshed) {
      // Force refresh data on page refresh
      forceRefresh();
    }

    // Check if service worker is available and handle first visit refresh
    if ('serviceWorker' in navigator && 'MessageChannel' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => {
            if (event.data.refresh) {
              window.location.reload();
            }
          };
          registration.active.postMessage({ type: 'CHECK_FIRST_VISIT' }, [channel.port2]);
        }
      });
    } else {
      // Fallback for browsers without service worker support
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem("lastVisitDate");

      if (lastVisit !== today) {
        localStorage.setItem("lastVisitDate", today);
        window.location.reload();
      }
    }
  }, [forceRefresh]);

  return (
    <>
      <PWAInstallPrompt />
      <div className="min-h-screen bg-white">
        <HeroSection />
        <PropertyListings />
        <FeaturesSection />
      </div>
    </>
  );
}