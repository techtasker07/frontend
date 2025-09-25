import { HeroSection } from "../components/HeroSection";
import { SearchSection } from "../components/SearchSection";
import { PropertyListings } from "../components/PropertyListings";
import { FeaturesSection } from "../components/FeaturesSection";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SearchSection />
      <PropertyListings />
      <FeaturesSection />
    </div>
  );
}