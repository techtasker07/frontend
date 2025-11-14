"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabaseApi } from "../lib/supabase-api";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { PropertyTypeDialog } from "./PropertyTypeDialog";

export function HeroSection() {
   const { isAuthenticated } = useAuth();
   const router = useRouter();
   const [heroImages, setHeroImages] = useState<{ id: string; image_url: string; alt_text?: string; is_active: boolean }[]>([]);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [email, setEmail] = useState('');
   const [showPropertyTypeDialog, setShowPropertyTypeDialog] = useState(false);

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
    <section className="relative bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-xl overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center">
          {/* Media First on Mobile */}
          <div className="relative lg:justify-self-end lg:order-2">
            <div className="relative w-full max-w-full rounded-xl md:max-w-md lg:max-w-lg h-64 aspect-video">
              {isVideo ? (
                <video
                  src={currentImage.image_url}
                  className="w-full h-full object-contain rounded-xl transition-opacity duration-1000 ease-in-out"
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
                  className="w-full h-full object-contain rounded-xl transition-opacity duration-1000 ease-in-out"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-lg text-center lg:text-left lg:order-1 md:bg-transparent bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-4 md:p-0">
            <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold text-[#000080] mb-2 leading-tight">
              Find & Do More With Your {" "}
              <span className="text-[#FFFFFF]">Property</span>
            </h1>

            <p className="text-[#FFFFFF] mb-8 text-sm leading-relaxed">
              Participate in polls, get ideal prospects, invest and discover the best real estate
              opportunities tailored just for you.
            </p>

            {/* Conditional Content based on authentication */}
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 mb-2 shadow-xl">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-white border-gray-200 rounded-full px-6"
                />
                <Button
                  className="h-12 px-8 bg-[#F000080] hover:bg-[#F39322] text-white rounded-full"
                  onClick={() => router.push(`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`)}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="mb-1">
                <Button
                  className="h-12 px-8 bg-[#000080] hover:bg-[#F39322] text-white rounded-full shadow-xl"
                  onClick={() => setShowPropertyTypeDialog(true)}
                >
                  Add a Property
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PropertyTypeDialog
        open={showPropertyTypeDialog}
        onOpenChange={setShowPropertyTypeDialog}
      />
    </section>
  );
}