"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, X, ArrowLeft, Home, CheckCircle, AlertCircle, User, RefreshCw, ThumbsUp, ThumbsDown, Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react"
import { toast } from "sonner"
import { identifyImageCategory, type IdentifiedCategory } from "@/lib/smartProspectGenerator"

// Confidence thresholds for identification results
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85, // 85% and above is high confidence
  MEDIUM: 0.60, // 60% to 85% is medium confidence
  LOW: 0.40,    // Below 60% is low confidence
  RETRY_ATTEMPTS: 2 // Maximum number of automatic retry attempts
}

interface ImageCapturePageProps {
  onClose: () => void
  onBack?: () => void
  onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
  fromLogin?: boolean
  autoStartCamera?: boolean
}

export function ImageCapturePage({ onClose, onBack, onImageCaptured, fromLogin = false, autoStartCamera = false }: ImageCapturePageProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [identifiedCategory, setIdentifiedCategory] = useState<IdentifiedCategory | null>(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [isHumanImage, setIsHumanImage] = useState(false)
  const [identificationError, setIdentificationError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low' | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [isCroppingMode, setIsCroppingMode] = useState<boolean>(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<null | 'se' | 'ne' | 'sw' | 'nw'>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [imageTranslate, setImageTranslate] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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
              setIsCroppingMode(true)

              // Initialize crop area
              setTimeout(() => {
                if (imageRef.current) {
                  const rect = imageRef.current.getBoundingClientRect()
                  const centerX = rect.width / 2 - 100
                  const centerY = rect.height / 2 - 100
                  setCropArea({
                    x: Math.max(0, centerX),
                    y: Math.max(0, centerY),
                    width: Math.min(200, rect.width),
                    height: Math.min(200, rect.height)
                  })
                }
              }, 100)
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
      setIsCroppingMode(true)

      // Initialize crop area for uploaded images
      setTimeout(() => {
        if (imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect()
          const centerX = rect.width / 2 - 150
          const centerY = rect.height / 2 - 150
          setCropArea({
            x: Math.max(0, centerX),
            y: Math.max(0, centerY),
            width: Math.min(300, rect.width),
            height: Math.min(300, rect.height)
          })
        }
      }, 150)
    } else {
      toast.error("Please select a valid image file.")
    }
  }

  // Enhanced image identification with retry logic
  const identifyImage = async (file: File, isRetry: boolean = false) => {
    if (!isRetry) {
      // Reset states for a fresh identification
      setIdentificationError(null)
      setRetryCount(0)
      setConfidenceLevel(null)
      setShowFeedback(false)
      setFeedbackGiven(false)
    }
    
    setIsIdentifying(true)
    setVerificationProgress(0)
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 300)
    
    try {
      const category = await identifyImageCategory(file)
      setIdentifiedCategory(category)
      
      // Determine confidence level
      if (category.confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
        setConfidenceLevel('high')
      } else if (category.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
        setConfidenceLevel('medium')
      } else {
        setConfidenceLevel('low')
      }
      
      // Check if this is a human image
      if (category.name === 'human') {
        setIsHumanImage(true)
        toast.error("Human image detected. Please upload a property image instead.", {
          duration: 5000
        })
      } else {
        setIsHumanImage(false)
        // Show appropriate notification based on confidence
        if (category.confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
          toast.success(`✨ Image identified as ${category.name.toUpperCase()} (${Math.round(category.confidence * 100)}% confidence)`, {
            duration: 3000
          })
        } else if (category.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
          toast.info(`🔍 Image appears to be ${category.name.toUpperCase()} (${Math.round(category.confidence * 100)}% confidence)`, {
            duration: 4000
          })
          // Show feedback option for medium confidence
          setTimeout(() => setShowFeedback(true), 1000)
        } else {
          toast.warning(`⚠️ Low confidence identification: ${category.name.toUpperCase()} (${Math.round(category.confidence * 100)}%)`, {
            duration: 4000
          })
          // Show feedback option for low confidence
          setTimeout(() => setShowFeedback(true), 1000)
        }
      }
    } catch (error) {
      console.error('Failed to identify image:', error)
      
      // Enhanced error handling
      let errorMessage = 'Failed to identify image category'
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        }
      }
      
      setIdentificationError(errorMessage)
      
      // Auto-retry for certain error types, up to the maximum retry count
      if (retryCount < CONFIDENCE_THRESHOLDS.RETRY_ATTEMPTS && !isRetry) {
        toast.info("Retrying image identification...", { duration: 2000 })
        setRetryCount(prev => prev + 1)
        
        // Wait a moment before retrying
        setTimeout(() => {
          identifyImage(file, true)
        }, 2000)
        return
      } else {
        toast.error(errorMessage)
      }
    } finally {
      clearInterval(progressInterval)
      setVerificationProgress(100)
      
      // After a short delay, hide the progress bar if identification was successful and confidence is high
      setTimeout(() => {
        if (!isHumanImage && !identificationError && confidenceLevel === 'high') {
          setVerificationProgress(0)
        }
      }, 1000)
      
      setIsIdentifying(false)
    }
  }
  
  // Handle user feedback on identification
  const handleFeedback = (isCorrect: boolean) => {
    if (isCorrect) {
      toast.success("Thanks for confirming! This helps us improve.", { duration: 3000 })
    } else {
      toast.info("Thanks for your feedback. We'll work on improving our identification.", { duration: 3000 })
    }
    
    // In a real implementation, you would send this feedback to a server
    // For now, we'll just log it and update the UI
    console.log("User feedback on identification:", {
      category: identifiedCategory?.name,
      confidence: identifiedCategory?.confidence,
      userFeedback: isCorrect ? "correct" : "incorrect"
    })
    
    setFeedbackGiven(true)
    
    // Hide feedback UI after a moment
    setTimeout(() => {
      setShowFeedback(false)
    }, 3000)
  }
  
  // Manually retry identification
  const handleRetryIdentification = () => {
    if (imageFile) {
      toast.info("Retrying image identification...")
      identifyImage(imageFile, true)
    }
  }

  const handleSubmit = () => {
    if (!imageFile) {
      toast.error("Please capture/select an image.")
      return
    }
    
    // Prevent submission if human image is detected
    if (isHumanImage) {
      toast.error("Cannot proceed with a human image. Please retake or upload a property image.")
      return
    }

    onImageCaptured(imageFile, identifiedCategory || undefined)
  }

  const handleCropAndContinue = useCallback(async () => {
    if (imageRef.current && canvasRef.current && capturedImage) {
      const canvas = canvasRef.current
      const img = imageRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        // Map displayed crop area to the image's natural size
        const rect = img.getBoundingClientRect()
        const scaleX = img.naturalWidth / rect.width
        const scaleY = img.naturalHeight / rect.height
        const srcX = Math.max(0, Math.round(cropArea.x * scaleX))
        const srcY = Math.max(0, Math.round(cropArea.y * scaleY))
        const srcW = Math.min(img.naturalWidth - srcX, Math.round(cropArea.width * scaleX))
        const srcH = Math.min(img.naturalHeight - srcY, Math.round(cropArea.height * scaleY))
        
        // Set canvas size to crop area (destination size)
        canvas.width = Math.max(1, Math.round(cropArea.width))
        canvas.height = Math.max(1, Math.round(cropArea.height))
        
        // Draw cropped portion of image
        ctx.drawImage(
          img,
          srcX, srcY, srcW, srcH,
          0, 0, canvas.width, canvas.height
        )
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const croppedFile = new File([blob], `prospect-cropped-${Date.now()}.jpg`, { type: "image/jpeg" })
            const croppedImageUrl = URL.createObjectURL(blob)
            
            // Clean up old image URL
            if (capturedImage) {
              URL.revokeObjectURL(capturedImage)
            }
            
            // Update state
            setCapturedImage(croppedImageUrl)
            setImageFile(croppedFile)
            setIsCroppingMode(false)
            
            // Reset crop state
            setCropArea({ x: 0, y: 0, width: 0, height: 0 })
            setImageScale(1)
            setImageTranslate({ x: 0, y: 0 })
            
            // Identify image category with cropped image
            await identifyImage(croppedFile)
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }, [cropArea, capturedImage, imageRef, canvasRef])

  const handleSkipCrop = async () => {
    if (imageFile) {
      setIsCroppingMode(false)
      // Reset crop state
      setCropArea({ x: 0, y: 0, width: 0, height: 0 })
      setImageScale(1)
      setImageTranslate({ x: 0, y: 0 })
      // Identify image category with original image
      await identifyImage(imageFile)
    }
  }

  const handleRetakeImage = () => {
    setCapturedImage(null)
    setImageFile(null)
    setIsCroppingMode(false)
    // Clean up the old image URL
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
    // Reset crop state
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setImageScale(1)
    setImageTranslate({ x: 0, y: 0 })
  }

  // Handle crop area dragging
  // Helpers to unify mouse/touch
  const getClient = (evt: any) => {
    if (evt.touches && evt.touches[0]) {
      return { clientX: evt.touches[0].clientX, clientY: evt.touches[0].clientY }
    }
    return { clientX: evt.clientX, clientY: evt.clientY }
  }

  const handleCropMouseDown = (e: any) => {
    const { clientX, clientY } = getClient(e)
    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    setIsDragging(true)
    // store pointer offset inside the crop box (local coords)
    setDragOffset({ x: clientX - rect.left - cropArea.x, y: clientY - rect.top - cropArea.y })
  }

  const handlePointerMove = (e: any) => {
    const rect = imageRef.current?.getBoundingClientRect()
    if (!rect) return
    const { clientX, clientY } = getClient(e)

    if (isDragging) {
      const newX = Math.max(0, Math.min(clientX - rect.left - dragOffset.x, rect.width - cropArea.width))
      const newY = Math.max(0, Math.min(clientY - rect.top - dragOffset.y, rect.height - cropArea.height))
      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing === 'se') {
      const minSize = 50
      const maxW = rect.width - cropArea.x
      const maxH = rect.height - cropArea.y
      const newW = Math.max(minSize, Math.min(clientX - rect.left - cropArea.x, maxW))
      const newH = Math.max(minSize, Math.min(clientY - rect.top - cropArea.y, maxH))
      setCropArea(prev => ({ ...prev, width: newW, height: newH }))
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setIsResizing(null)
  }

  // Handle crop area resizing start
  const handleCropResizeStart = (corner: 'se' | 'ne' | 'sw' | 'nw', e: any) => {
    e.stopPropagation()
    setIsResizing(corner)
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setImageFile(null)
    setIsCroppingMode(false)
    // Clean up image URL
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
    // Reset crop state
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setImageScale(1)
    setImageTranslate({ x: 0, y: 0 })
    onClose()
  }

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStartCamera && !isCapturing && !capturedImage) {
      startCamera()
    }
  }, [autoStartCamera])

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
        <div className="flex-1 p-4 pt-16 pb-6 space-y-6 max-w-2xl mx-auto w-full">
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
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="flex-1 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera controls overlay - Google Lens style */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                <div className="flex items-center gap-8">
                  {/* Gallery/Select Image Button (left side) */}
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 border-2 border-white/30 flex items-center justify-center"
                    title="Select from gallery"
                  >
                    <Upload className="h-6 w-6" />
                  </Button>
                  
                  {/* Capture Button (center) */}
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center"
                    title="Take photo"
                  >
                    <Camera className="h-8 w-8" />
                  </Button>
                  
                  {/* Close/Exit Button (right side) */}
                  <Button
                    onClick={stopCamera}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 border-2 border-white/30 flex items-center justify-center"
                    title="Close camera"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Top hint */}
              <div className="absolute top-8 left-0 right-0 flex justify-center">
                <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  Position property in frame and tap to capture
                </div>
              </div>
            </div>
          )}

          {isCroppingMode && capturedImage && (
            <div className="fixed inset-0 z-50 bg-black">
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent">
                <Button variant="ghost" size="sm" onClick={handleSkipCrop} className="text-white border-0 hover:bg-white/10 flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-1" /> Back
                </Button>
                <h3 className="text-white text-lg font-semibold">Crop Your Property Image</h3>
                <Button variant="ghost" size="sm" onClick={handleSkipCrop} className="text-white border-0 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Full screen image container */}
              <div 
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onTouchCancel={handlePointerUp}
              >
                <div className="relative max-w-full max-h-full">
                  <img
                    ref={imageRef}
                    src={capturedImage}
                    alt="Property image for cropping"
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                    onLoad={() => {
                      if (imageRef.current) {
                        const rect = imageRef.current.getBoundingClientRect()
                        setCropArea({
                          x: rect.width * 0.1,
                          y: rect.height * 0.1,
                          width: rect.width * 0.8,
                          height: rect.height * 0.8
                        })
                      }
                    }}
                  />
                  
                  {/* Crop overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/50" />
                    
                    {/* Crop area */}
                    <div 
                      className="absolute border-2 border-white bg-transparent cursor-move pointer-events-auto"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                      }}
                      onMouseDown={handleCropMouseDown}
                      onTouchStart={handleCropMouseDown}
                    >
                      {/* Corner handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize" />
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"
                        onMouseDown={(e) => handleCropResizeStart('se', e)}
                        onTouchStart={(e) => handleCropResizeStart('se', e)}
                      />
                      
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex gap-4">
                  <Button 
                    onClick={handleCropAndContinue} 
                    className="flex-1 bg-white text-black hover:bg-gray-100 border-0 shadow-xl py-4 text-lg font-semibold rounded-xl"
                  >
                    <Crop className="mr-2 h-5 w-5" />
                    Crop & Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSkipCrop} 
                    className="border-2 border-white/60 text-black hover:bg-white/10 py-4 px-6 text-lg font-medium rounded-xl"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar for image verification */}
          {isIdentifying && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-purple-700 font-medium">Verifying image...</p>
                <p className="text-xs text-purple-600">{verificationProgress}%</p>
              </div>
              <Progress value={verificationProgress} className="h-2 bg-purple-100" />
            </div>
          )}
          
          {/* Error state with retry option */}
          {identificationError && !isIdentifying && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium mb-2">{identificationError}</p>
                  <Button 
                    onClick={handleRetryIdentification}
                    size="sm"
                    className="bg-red-100 hover:bg-red-200 text-red-800 border-0"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Identification
                  </Button>
                </div>
              </div>
            </div>
          )}

          {capturedImage && !isCroppingMode && (
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured property"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
                {identifiedCategory && !isIdentifying && (
                  <div className="absolute top-3 left-3">
                    <Badge 
                      className={`
                        ${isHumanImage ? 'bg-red-500' : 
                          confidenceLevel === 'high' ? 'bg-green-500' : 
                          confidenceLevel === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'} 
                        text-white border-0 shadow-lg flex items-center`}
                    >
                      {isHumanImage ? (
                        <User className="w-3 h-3 mr-1" />
                      ) : confidenceLevel === 'high' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {identifiedCategory.name.toUpperCase()} ({Math.round(identifiedCategory.confidence * 100)}%)
                    </Badge>
                  </div>
                )}
              </div>

              {/* Human image warning */}
              {isHumanImage && identifiedCategory && !isIdentifying && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      Human image detected
                    </p>
                    <p className="text-xs text-red-700">
                      We can only generate prospects for property images. Please retake or upload a photo of a property.
                    </p>
                  </div>
                </div>
              )}

              {/* Property category identification with confidence levels */}
              {identifiedCategory && !isHumanImage && !isIdentifying && !identificationError && (
                <div className={`bg-gradient-to-r 
                  ${confidenceLevel === 'high' ? 'from-green-50 to-blue-50 border-green-200' : 
                   confidenceLevel === 'medium' ? 'from-yellow-50 to-green-50 border-yellow-200' : 
                   'from-orange-50 to-yellow-50 border-orange-200'}
                  p-4 rounded-lg border flex items-start`}
                >
                  {confidenceLevel === 'high' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  ) : confidenceLevel === 'medium' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`text-sm font-medium
                      ${confidenceLevel === 'high' ? 'text-green-800' : 
                       confidenceLevel === 'medium' ? 'text-yellow-800' : 
                       'text-orange-800'}`}
                    >
                      {confidenceLevel === 'high' ? '✅' : '⚠️'} Image identified as {identifiedCategory.name.toUpperCase()}
                    </p>
                    <p className={`text-xs
                      ${confidenceLevel === 'high' ? 'text-green-700' : 
                       confidenceLevel === 'medium' ? 'text-yellow-700' : 
                       'text-orange-700'}`}
                    >
                      Confidence: {Math.round(identifiedCategory.confidence * 100)}% • 
                      {confidenceLevel === 'high' 
                        ? 'Ready for smart prospect generation!' 
                        : confidenceLevel === 'medium'
                        ? 'Proceed with caution or try a clearer image.'
                        : 'Consider retaking the photo for better results.'}
                    </p>
                    
                    {/* Feedback system for medium/low confidence identifications */}
                    {showFeedback && !feedbackGiven && (confidenceLevel === 'medium' || confidenceLevel === 'low') && (
                      <div className="mt-2 flex items-center">
                        <span className="text-xs mr-2">Is this identification correct?</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2 mr-2 border-green-300 bg-green-50 hover:bg-green-100 text-green-700"
                          onClick={() => handleFeedback(true)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Yes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2 border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                          onClick={() => handleFeedback(false)}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          No
                        </Button>
                      </div>
                    )}
                    
                    {/* If confidence is low, show retry button */}
                    {confidenceLevel === 'low' && !feedbackGiven && (
                      <Button 
                        size="sm"
                        onClick={handleRetryIdentification}
                        className="mt-2 bg-orange-100 hover:bg-orange-200 text-orange-800 border-0"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Try Again
                      </Button>
                    )}
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
                  disabled={isHumanImage || isIdentifying || !!identificationError}
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold ${(isHumanImage || !!identificationError) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            {capturedImage && !isHumanImage && !identificationError && (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
              >
                Continue
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
