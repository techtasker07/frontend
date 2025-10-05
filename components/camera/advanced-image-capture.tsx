"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Camera,
  Upload,
  X,
  ArrowLeft,
  Home
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import {
  captureFromCamera,
  compressImage
} from '@/lib/advanced-image-processing'
import {
  identifyImageCategory,
  type IdentifiedCategory,
  performSmartAnalysis,
  type SmartProspect
} from '@/lib/smartProspectGenerator'

// Invalid image categories that should be rejected - DISABLED: Allow all images
const INVALID_CATEGORIES = []

interface AdvancedImageCaptureProps {
   onClose: () => void
   onBack?: () => void
   onBackToWelcome?: () => void
   onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
   fromLogin?: boolean
   autoStartCamera?: boolean
 }

export function AdvancedImageCapture({
     onClose,
     onBack,
     onBackToWelcome,
     onImageCaptured,
     fromLogin = false,
     autoStartCamera = false
   }: AdvancedImageCaptureProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isCapturing, setIsCapturing] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

   const videoRef = useRef<HTMLVideoElement>(null)
   const canvasRef = useRef<HTMLCanvasElement>(null)
   const fileInputRef = useRef<HTMLInputElement>(null)

  // Simplified camera startup
   const startCamera = async () => {
     try {
       setIsCapturing(true)
       const mediaStream = await captureFromCamera({
         facingMode: 'environment',
         width: 1920,
         height: 1080
       })

       setStream(mediaStream)
       if (videoRef.current) {
         videoRef.current.srcObject = mediaStream
       }
     } catch (error) {
       console.error('Camera access failed:', error)
       setIsCapturing(false)
     }
   }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  // Simplified photo capture with instant processing
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        
        try {
          const blob = await new Promise<Blob>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Canvas toBlob timeout'))
            }, 5000) // 5 second timeout

            canvas.toBlob((b) => {
              clearTimeout(timeout)
              if (b) {
                resolve(b)
              } else {
                reject(new Error('Failed to create blob from canvas'))
              }
            }, "image/jpeg", 0.9)
          })
          
          const file = new File([blob], `prospect-${Date.now()}.jpg`, { type: "image/jpeg" })
          
          stopCamera()
          console.log('📷 Photo captured, processing instantly...')
          
          // Process image instantly and navigate to prospects
          await processImageInstantly(file)
          
        } catch (error) {
          console.error('Photo capture failed:', error)
        }
      }
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0]
     if (file && file.type.startsWith("image/")) {
       console.log('📁 File selected, processing instantly...')

       // Process uploaded image instantly
       await processImageInstantly(file)
     }
   }

  // Instant image processing function with complete smart analysis
   const processImageInstantly = async (file: File) => {
     setIsProcessing(true)

     try {
       console.log('🚀 Starting instant processing for:', file.name)

       // Compress image if needed
       let processedFile = file
       if (file.size > 2 * 1024 * 1024) {
         console.log('🗜️ Compressing large image...')
         processedFile = await compressImage(file, {
           maxSizeMB: 1.5,
           maxWidthOrHeight: 2048,
           quality: 0.85
         })
       }

       // Create image URL for display
       const imageUrl = URL.createObjectURL(processedFile)

       // Perform complete smart analysis
       console.log('🔍 Performing complete smart analysis...')

       const analysisResult = await performSmartAnalysis(processedFile)
       console.log('✅ Analysis complete:', analysisResult)

       // Valid property image - navigate to property details page
       console.log('✅ Valid property image, navigating to property details form...')

       // Navigate to property details page with data
       const params = new URLSearchParams({
         imageUrl: encodeURIComponent(imageUrl),
         identifiedCategory: encodeURIComponent(JSON.stringify(analysisResult.identifiedCategory)),
         propertyDetails: encodeURIComponent(JSON.stringify(analysisResult.propertyDetails)),
         prospects: encodeURIComponent(JSON.stringify(analysisResult.smartProspects || [])),
         userId: user?.id || ''
       })

       router.push(`/ai/property-details?${params.toString()}`)

     } catch (error) {
       console.error('💥 Instant processing failed:', error)
     } finally {
       setIsProcessing(false)
     }
   }



  const handleClose = () => {
    stopCamera()
    onClose()
  }

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStartCamera && !isCapturing) {
      startCamera()
    }
  }, [autoStartCamera, isCapturing])

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
              {fromLogin && onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
                  title="Go back to Welcome"
                >
                  <ArrowLeft className="h-5 w-5 text-blue-600" />
                </Button>
              )}
              <Camera className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className={`text-lg sm:text-xl font-bold truncate ${fromLogin ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                Smart Property Capture
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

        {/* Mobile Navigation - Top corners */}
        <div className="md:hidden fixed top-4 left-4 right-4 z-30 flex justify-between">
          {fromLogin && onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-10 w-10 p-0 bg-white/90 hover:bg-blue-100 rounded-full shadow-lg"
              title="Go back to Welcome"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
          )}
          <div className="flex-1"></div>
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
        <div className="flex-1 p-4 pt-16 pb-6 space-y-6 max-w-2xl mx-auto w-full">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select image file"
          />

          {!isCapturing && !isProcessing && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Capture property images with instant AI-powered processing!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={startCamera}
                    disabled={isProcessing}
                    className="flex flex-col items-center p-8 h-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="h-12 w-12 mb-3" />
                    <span className="text-lg font-semibold">Smart Capture</span>
                    <span className="text-sm opacity-90">Instant processing</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex flex-col items-center p-8 h-auto border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                  >
                    <Upload className="h-12 w-12 mb-3 text-purple-600" />
                    <p className="text-sm font-bold">Upload</p>
                    <span className="text-lg font-semibold text-purple-800">Select & Process</span>
                    <span className="text-sm text-purple-600">Instant analysis</span>
                  </Button>
                </div>
              </div>

              {fromLogin && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <Camera className="mr-2 h-4 w-4" />
                    Smart Features:
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Simple image capture
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Automatic image compression
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Universal image processing
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Direct form navigation
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Camera view */}
          {isCapturing && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="flex-1 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera controls overlay - Enhanced with better visibility */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-20">
                <div className="flex items-center gap-6">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    size="lg"
                    className="w-14 h-14 rounded-full bg-black/60 text-white hover:bg-black/80 border-2 border-white/40 flex flex-col items-center justify-center backdrop-blur-sm"
                    title="Select from gallery"
                  >
                    <Upload className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-100 border-4 border-white shadow-2xl flex items-center justify-center relative overflow-hidden"
                    title="Capture photo"
                  >
                    <div className="absolute inset-2 rounded-full border-2 border-black/20"></div>
                    <Camera className="h-8 w-8 text-black" />
                  </Button>
                  
                  <Button
                    onClick={stopCamera}
                    variant="ghost"
                    size="lg"
                    className="w-14 h-14 rounded-full bg-black/60 text-white hover:bg-black/80 border-2 border-white/40 flex flex-col items-center justify-center backdrop-blur-sm"
                    title="Close camera"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>


            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 mb-4">
                   <Camera className="w-full h-full text-purple-600 animate-pulse" />
                 </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Processing Image...
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                   Processing image and preparing form
                 </p>
                <div className="w-full max-w-xs">
                  <Progress value={75} className="h-2 bg-purple-100" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Simplified bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3 max-w-2xl mx-auto">
            {fromLogin && onBack && (
              <Button 
                onClick={onBack}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleClose}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 py-3"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

    </div>
  )
}
