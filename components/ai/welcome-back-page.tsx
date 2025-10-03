"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, Home } from "lucide-react"

interface WelcomeBackPageProps {
  userName: string
  onStartAnalysis?: () => void
  onSkip: () => void
  onClose: () => void
}

export function WelcomeBackPage({ userName, onStartAnalysis, onSkip, onClose }: WelcomeBackPageProps) {
  const handleCameraOpen = () => {
    if (onStartAnalysis) {
      onStartAnalysis()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#000080' }}>
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome back, {userName}
                </h1>
                <p className="text-sm text-gray-500">Property Analysis Dashboard</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-gray-100"
              title="Close and go to Dashboard"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 sm:p-12">
              <div className="text-center">
                {/* Camera Button */}
                <button
                  onClick={handleCameraOpen}
                  className="relative inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 group"
                >
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: '#F39322', opacity: 0.05 }}
                  ></div>
                  <Camera className="h-14 w-14 relative z-10" style={{ color: '#000080' }} />
                  
                  {/* Status Indicator */}
                  <div 
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: '#F39322' }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </button>

                {/* Content */}
                <div className="mt-8 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Smart Property Analysis
                  </h2>
                  <p className="text-base text-gray-600 max-w-md mx-auto">
                    Capture property images and get instant AI-powered analysis to help you make informed decisions.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleCameraOpen}
                    className="text-white font-medium px-8 py-3 h-auto hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#000080' }}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Analysis
                  </Button>
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    className="border-2 font-medium px-8 py-3 h-auto hover:bg-gray-50"
                    style={{ borderColor: '#F39322', color: '#F39322' }}
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="border-t border-gray-200 px-8 py-4" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#000080' }}></div>
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#F39322' }}></div>
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#000080' }}></div>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#000080', opacity: 0.1 }}>
                <Camera className="h-5 w-5" style={{ color: '#000080' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Capture</h3>
              <p className="text-sm text-gray-600">Take clear photos of the property</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#F39322', opacity: 0.1 }}>
                <svg className="h-5 w-5" style={{ color: '#F39322' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Analyze</h3>
              <p className="text-sm text-gray-600">AI processes the images instantly</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#000080', opacity: 0.1 }}>
                <svg className="h-5 w-5" style={{ color: '#000080' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Results</h3>
              <p className="text-sm text-gray-600">Get detailed property insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}