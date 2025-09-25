"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabaseApi } from "../lib/supabase-api";

export function HeroSection() {
  const [heroImage, setHeroImage] = useState<{ image_url: string; alt_text?: string }>({
    image_url: "",
    alt_text: "Modern 3D house design"
  });

  useEffect(() => {
    const fetchHeroImage = async () => {
      const response = await supabaseApi.getActiveHeroImage();
      if (response.success && response.data.image_url) {
        setHeroImage(response.data);
      }
    };

    fetchHeroImage();
  }, []);
  return (
    <section className="relative bg-gradient-to-br from-[#FBD9B9] to-[#C1DEE8] overflow-hidden">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-4 py-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#000080] mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="text-[#F39322]">Property</span>
            </h1>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Discover, poll, and invest in the best real estate
              opportunities.
            </p>

            {/* Email Input */}
            <div className="flex gap-3 mb-8">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 bg-white border-gray-200 rounded-full px-6"
              />
              <Button className="h-12 px-8 bg-[#F39322] hover:bg-[#000080] text-white rounded-full">
                Get Started
              </Button>
            </div>

            <p className="text-gray-600 text-sm">
              From luxury homes to commercial spaces, find
              properties that match your vision.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative lg:justify-self-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <img
                src={heroImage.image_url || "/api/placeholder/400/300"}
                alt={heroImage.alt_text || "Modern 3D house design"}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}