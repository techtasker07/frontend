"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Sparkles, X, Home } from "lucide-react"
import { ImageCapturePage } from "./image-capture-page"
import { type IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface WelcomeBackPageProps {
   userName: string
   onStartAnalysis?: () => void
   onSkip: () => void
   onClose: () => void
 }

export function WelcomeBackPage({ userName, onStartAnalysis, onSkip, onClose }: WelcomeBackPageProps) {
   const handleCameraClick = () => {
     if (onStartAnalysis) {
       onStartAnalysis()
     }
   }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:block sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1 min-w-0">
              <Sparkles className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0 animate-pulse" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Welcome back, {userName}!
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
              title="Close and go to Dashboard"
            >
              <X className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Mobile Close Button - Top right corner */}
        <div className="md:hidden fixed top-4 right-4 z-30">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-10 w-10 p-0 bg-white/90 hover:bg-red-100 rounded-full shadow-lg"
            title="Close and go to Dashboard"
          >
            <X className="h-5 w-5 text-red-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-6 flex items-center justify-center">
          <div className="max-w-2xl mx-auto w-full text-center space-y-6">
            <div className="space-y-6">
              {/* Camera Icon as a Button with Animation */}
              <button
                onClick={handleCameraClick}
                className="relative mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-8 shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition transform hover:scale-105"
              >
                <Camera className="h-10 w-10 text-purple-600" />
                
                {/* Sparkle animation */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                  <h3 className="text-xl font-bold">Click here to get prospects</h3>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>

                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping opacity-30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-purple-400 animate-pulse opacity-40"></div>
              </button>

              {/* Feature Description */}
              <div className="space-y-4">
                
                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 py-4 px-6"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
