"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabaseApi } from "../lib/supabase-api";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [heroImages, setHeroImages] = useState<{ id: string; image_url: string; alt_text?: string; is_active: boolean }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [email, setEmail] = useState('');

  // Function to check if URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  useEffect(() => {
    const fetchHeroImages = async () => {
      const response = await supabaseApi.getAllHeroImages();
      if (response.success && response.data.length > 0) {
        setHeroImages(response.data);
      } else {
        // Fallback to active image if no images found
        const fallbackResponse = await supabaseApi.getActiveHeroImage();
        if (fallbackResponse.success && fallbackResponse.data.image_url) {
          setHeroImages([{
            id: 'fallback',
            image_url: fallbackResponse.data.image_url,
            alt_text: fallbackResponse.data.alt_text,
            is_active: true
          }]);
        }
      }
    };

    fetchHeroImages();
  }, []);

  // Cycle through images every 20 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const currentImage = heroImages[currentImageIndex] || { image_url: "", alt_text: "" };
  const isVideo = isVideoUrl(currentImage.image_url);

  return (
    <section className="relative bg-gradient-to-br from-[135deg, #667eea 0%, #764ba2 100%] overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-4 py-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-lg">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#000080] mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="text-[#F39322]">Property</span>
            </h1>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Discover, poll, and invest in the best real estate
              opportunities.
            </p>

            {/* Conditional Content based on authentication */}
            {!isAuthenticated ? (
              <div className="flex gap-3 mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-white border-gray-200 rounded-full px-6"
                />
                <Button
                  className="h-12 px-8 bg-[#F39322] hover:bg-[#000080] text-white rounded-full"
                  onClick={() => router.push(`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`)}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="mb-8">
                <Button
                  className="h-12 px-8 bg-[#F39322] hover:bg-[#000080] text-white rounded-full"
                  onClick={() => router.push('/add-property')}
                >
                  Add a Property
                </Button>
              </div>
            )}

            <p className="text-gray-600 text-sm">
              From luxury homes to commercial spaces, find
              properties that match your vision.
            </p>
          </div>

          {/* Right Media */}
          <div className="relative lg:justify-self-end">
            <div className="relative w-full max-w-md lg:max-w-lg h-80">
              {isVideo ? (
                <video
                  src={currentImage.image_url}
                  className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              ) : (
                <img
                  src={currentImage.image_url || "/api/placeholder/400/300"}
                  alt={currentImage.alt_text || ""}
                  className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}