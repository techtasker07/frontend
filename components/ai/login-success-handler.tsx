"use client"

import { useState, useEffect } from "react"
import { SmartProspectFeature } from "./ai-prospect-feature"
import { useAuth } from "@/lib/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Sparkles, X } from "lucide-react"

interface LoginSuccessHandlerProps {
  onLoginSuccess?: () => void
}

export function LoginSuccessHandler({ onLoginSuccess }: LoginSuccessHandlerProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showSmartProspectFeature, setShowSmartProspectFeature] = useState(false)
  const { user, isAuthenticated, justLoggedIn, setJustLoggedIn } = useAuth()

  useEffect(() => {
    // Check if user just logged in
    if (isAuthenticated && user && justLoggedIn) {
      setShowWelcomeModal(true)
      setJustLoggedIn(false) // Reset the flag
      onLoginSuccess?.()
    }
  }, [isAuthenticated, user, justLoggedIn, setJustLoggedIn, onLoginSuccess])

  const handleStartSmartProspect = () => {
    setShowWelcomeModal(false)
    setShowSmartProspectFeature(true)
  }

  const handleSkip = () => {
    setShowWelcomeModal(false)
  }

  const handleSmartProspectClose = () => {
    setShowSmartProspectFeature(false)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-lg border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative z-10">
            <DialogHeader className="text-center">
              <DialogTitle className="flex items-center justify-center text-2xl font-bold mb-2">
                <Sparkles className="mr-3 h-7 w-7 text-purple-600 animate-pulse" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome back, {user.first_name}!
                </span>
              </DialogTitle>
              <DialogDescription className="text-lg text-slate-600">
                🎉 Ready to discover new property investment opportunities?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              <div className="text-center">
                <div className="relative mx-auto w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Camera className="h-14 w-14 text-purple-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping opacity-30"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                  Smart Property Analysis
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Take a photo or select an image of any property to get instant smart investment insights and prospect analysis!
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200 shadow-sm">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  What you'll get:
                </h4>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Instant property valuation estimate
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Market analysis and investment insights
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Risk assessment and recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                    Option to add as prospect property
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleStartSmartProspect}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Start Smart Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
                >
                  <X className="mr-2 h-4 w-4" />
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Prospect Feature */}
      <SmartProspectFeature
        isOpen={showSmartProspectFeature}
        onClose={handleSmartProspectClose}
        triggerOnLogin={true}
      />

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
    </>
  )
}
