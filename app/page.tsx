import { HeroSection } from "../components/HeroSection";
import { PropertyListings } from "../components/PropertyListings";
import { FeaturesSection } from "../components/FeaturesSection";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

export default function App() {
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