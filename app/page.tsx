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
    if (typeof window === 'undefined') return;

    // Only refetch data when the page is actually reloaded, not on SPA navigations
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navEntry = navEntries[0];
    const wasRefreshed =
      navEntry?.type === 'reload' ||
      window.performance?.navigation?.type === 1;

    if (wasRefreshed) {
      forceRefresh();
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