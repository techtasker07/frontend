"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, ArrowLeft, Home, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { identifyImageCategory, type IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface ImageCapturePageProps {
  onClose: () => void
  onBack?: () => void
  onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
  fromLogin?: boolean
}

export function ImageCapturePage({ onClose, onBack, onImageCaptured, fromLogin = false }: ImageCapturePageProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [identifiedCategory, setIdentifiedCategory] = useState<IdentifiedCategory | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.")
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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const file = new File([blob], `prospect-${Date.now()}.jpg`, { type: "image/jpeg" })
              const imageUrl = URL.createObjectURL(blob)
              setCapturedImage(imageUrl)
              setImageFile(file)
              stopCamera()
              
              // Identify image category
              await identifyImage(file)
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)
      setImageFile(file)
      
      // Identify image category
      await identifyImage(file)
    } else {
      toast.error("Please select a valid image file.")
    }
  }

  const identifyImage = async (file: File) => {
    setIsIdentifying(true)
    try {
      const category = await identifyImageCategory(file)
      setIdentifiedCategory(category)
      
      // Show success notification
      toast.success(`✨ Image identified as ${category.name.toUpperCase()} (${Math.round(category.confidence * 100)}% confidence)`, {
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to identify image:', error)
      toast.error('Failed to identify image category')
    } finally {
      setIsIdentifying(false)
    }
  }

  const handleSubmit = () => {
    if (!imageFile) {
      toast.error("Please capture/select an image.")
      return
    }

    onImageCaptured(imageFile, identifiedCategory || undefined)
  }

  const handleRetakeImage = () => {
    setCapturedImage(null)
    setImageFile(null)
    // Clean up the old image URL
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setImageFile(null)
    // Clean up image URL
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
    onClose()
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
                Capture Property Image
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
        <div className="flex-1 p-4 pb-6 space-y-6 max-w-2xl mx-auto w-full">
          {!capturedImage && !isCapturing && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Take a photo or select an image of a property to get AI-powered prospect analysis!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Button 
                    onClick={startCamera} 
                    className="flex flex-col items-center p-8 h-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="h-12 w-12 mb-3" />
                    <span className="text-lg font-semibold">Take Photo</span>
                    <span className="text-sm opacity-90">Use camera</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-8 h-auto border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                  >
                    <Upload className="h-12 w-12 mb-3 text-purple-600" />
                    <span className="text-lg font-semibold text-purple-800">Select Image</span>
                    <span className="text-sm text-purple-600">From gallery</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Select image file"
                />
              </div>

              {fromLogin && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <Camera className="mr-2 h-4 w-4" />
                    What you'll get:
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Instant property analysis across multiple categories
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Investment prospects with cost estimates
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Smart recommendations and insights
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Option to add as prospect property
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {isCapturing && (
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={stopCamera}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured property"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
                {identifiedCategory && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 text-white border-0 shadow-lg flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {identifiedCategory.name.toUpperCase()} ({Math.round(identifiedCategory.confidence * 100)}%)
                    </Badge>
                  </div>
                )}
              </div>

              {/* Category identification notification */}
              {identifiedCategory && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Image identified as {identifiedCategory.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-green-700">
                      Confidence: {Math.round(identifiedCategory.confidence * 100)}% • Ready for smart prospect generation!
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>✨ Smart Analysis Ready</strong>
                </p>
                <p className="text-xs text-blue-700">
                  Our AI will analyze your property image and generate 5 diverse investment prospects across different categories automatically.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
                >
                  Analyze Property
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRetakeImage}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
                >
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom action area */}
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
            {capturedImage && (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
              >
                Continue to Analysis
              </Button>
            )}
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
