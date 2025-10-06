"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Sparkles, X, Home } from "lucide-react"

interface WelcomeBackPageProps {
  userName?: string
  onStartAnalysis?: () => void
  onSkip?: () => void
  onClose?: () => void
}

export default function WelcomeBackPage({ 
  userName = "John", 
  onStartAnalysis, 
  onSkip, 
  onClose 
}: WelcomeBackPageProps) {
  const handleCameraClick = () => {
    if (onStartAnalysis) {
      onStartAnalysis()
    } else {
      alert("Camera capture started!")
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      alert("Closing and returning to dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 relative overflow-x-hidden">
      {/* Animated background elements with scattered icons */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Scattered decorative icons */}
        <Home className="absolute top-20 left-10 w-16 h-16 text-purple-300 opacity-20 animate-float" style={{ animationDelay: '0s' }} />
        <Sparkles className="absolute top-40 right-20 w-12 h-12 text-pink-300 opacity-25 animate-float" style={{ animationDelay: '1s' }} />
        <Camera className="absolute bottom-32 left-16 w-14 h-14 text-cyan-300 opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <Home className="absolute top-1/3 right-12 w-20 h-20 text-purple-200 opacity-15 animate-float" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute bottom-48 right-32 w-10 h-10 text-pink-200 opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
        <Camera className="absolute top-1/4 left-1/4 w-12 h-12 text-blue-300 opacity-15 animate-float" style={{ animationDelay: '2.5s' }} />
        <Home className="absolute bottom-20 right-1/4 w-16 h-16 text-purple-300 opacity-20 animate-float" style={{ animationDelay: '3s' }} />
        <Sparkles className="absolute top-1/2 left-20 w-14 h-14 text-pink-300 opacity-15 animate-float" style={{ animationDelay: '1.8s' }} />
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
              onClick={handleClose}
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
            onClick={handleClose}
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
                className="relative mx-auto w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 transition-all transform hover:scale-110 hover:rotate-6 group"
              >
                <Camera className="h-12 w-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                
                {/* Sparkle animation */}
                <div className="absolute -top-12 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
                  <h3 className="text-sm font-semibold whitespace-nowrap">
                    Click to capture
                  </h3>

                  {/* Chat bubble tail */}
                  <div className="absolute bottom-[-6px] right-16 w-3 h-3 bg-gradient-to-br from-purple-600 to-pink-600 rotate-45"></div>
                </div>

                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-40"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
              </button>

              {/* Feature Description */}
              <div className="space-y-4">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}