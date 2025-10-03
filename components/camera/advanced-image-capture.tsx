"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Camera, 
  Upload, 
  X, 
  ArrowLeft, 
  Home, 
  CheckCircle, 
  AlertCircle, 
  User, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Crop, 
  RotateCw,
  Maximize2,
  Zap,
  Target
} from 'lucide-react'
import { QuadrilateralCropper } from './quadrilateral-cropper'
import { toast } from 'sonner'
import { 
  captureFromCamera,
  autoDetectSubject,
  compressImage,
  createImageFile,
  loadOpenCV,
  DetectedSubject,
  Point
} from '@/lib/advanced-image-processing'
import { identifyImageCategory, type IdentifiedCategory } from '@/lib/smartProspectGenerator'

// Confidence thresholds for identification results
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85, // 85% and above is high confidence
  MEDIUM: 0.60, // 60% to 85% is medium confidence
  LOW: 0.40,    // Below 60% is low confidence
  RETRY_ATTEMPTS: 2 // Maximum number of automatic retry attempts
}

interface AdvancedImageCaptureProps {
  onClose: () => void
  onBack?: () => void
  onImageCaptured: (imageFile: File, identifiedCategory?: IdentifiedCategory) => void
  fromLogin?: boolean
  autoStartCamera?: boolean
}

export function AdvancedImageCapture({ 
  onClose, 
  onBack, 
  onImageCaptured, 
  fromLogin = false, 
  autoStartCamera = false 
}: AdvancedImageCaptureProps) {
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
  const [detectedSubject, setDetectedSubject] = useState<DetectedSubject | null>(null)
  const [isDetectingSubject, setIsDetectingSubject] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [openCVLoaded, setOpenCVLoaded] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load OpenCV on component mount
  useEffect(() => {
    loadOpenCV().then(loaded => {
      setOpenCVLoaded(loaded)
      if (loaded) {
        toast.success('Advanced image processing enabled!')
      } else {
        toast.info('Using basic image processing (OpenCV unavailable)')
      }
    }).catch(console.error)
  }, [])

  // Enhanced camera startup with better settings
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
      
      toast.success('Camera ready with enhanced settings!')
    } catch (error) {
      console.error('Camera access failed:', error)
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

  // Enhanced photo capture with auto-detection
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
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
          })
          
          const file = new File([blob], `prospect-${Date.now()}.jpg`, { type: "image/jpeg" })
          const imageUrl = URL.createObjectURL(blob)
          
          setCapturedImage(imageUrl)
          setImageFile(file)
          stopCamera()
          
          // Auto-detect subject immediately
          await performAutoDetection(imageUrl)
          
        } catch (error) {
          console.error('Photo capture failed:', error)
          toast.error('Failed to capture photo')
        }
      }
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)
      setImageFile(file)
      
      // Auto-detect subject in uploaded file
      await performAutoDetection(imageUrl)
      
    } else {
      toast.error("Please select a valid image file.")
    }
  }

  // Perform auto-detection on captured/uploaded image
  const performAutoDetection = async (imageUrl: string) => {
    setIsDetectingSubject(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      const detected = await autoDetectSubject(img)
      
      if (detected) {
        setDetectedSubject(detected)
        toast.success(`Auto-detected ${detected.type} (${Math.round(detected.confidence * 100)}% confidence)`)
        
        // If confidence is high enough, go directly to cropping
        if (detected.confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
          setIsCroppingMode(true)
        } else {
          // Show options for medium/low confidence
          toast.info("Detection confidence is moderate. You can adjust the crop manually.")
          setTimeout(() => setIsCroppingMode(true), 2000)
        }
      } else {
        toast.info("No subject detected. Manual crop adjustment available.")
        setIsCroppingMode(true)
      }
    } catch (error) {
      console.error('Auto-detection failed:', error)
      toast.warning("Auto-detection failed. Proceeding with manual crop.")
      setIsCroppingMode(true)
    } finally {
      setIsDetectingSubject(false)
    }
  }

  // Enhanced image identification with retry logic
  const identifyImage = async (file: File, isRetry: boolean = false) => {
    if (!isRetry) {
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
          setTimeout(() => setShowFeedback(true), 1000)
        } else {
          toast.warning(`⚠️ Low confidence identification: ${category.name.toUpperCase()} (${Math.round(category.confidence * 100)}%)`, {
            duration: 4000
          })
          setTimeout(() => setShowFeedback(true), 1000)
        }
      }
    } catch (error) {
      console.error('Failed to identify image:', error)
      
      let errorMessage = 'Failed to identify image category'
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        }
      }
      
      setIdentificationError(errorMessage)
      
      // Auto-retry for certain error types
      if (retryCount < CONFIDENCE_THRESHOLDS.RETRY_ATTEMPTS && !isRetry) {
        toast.info("Retrying image identification...", { duration: 2000 })
        setRetryCount(prev => prev + 1)
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
    
    console.log("User feedback on identification:", {
      category: identifiedCategory?.name,
      confidence: identifiedCategory?.confidence,
      userFeedback: isCorrect ? "correct" : "incorrect"
    })
    
    setFeedbackGiven(true)
    setTimeout(() => {
      setShowFeedback(false)
    }, 3000)
  }

  // Handle crop completion with compression
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCompressing(true)
    setCompressionProgress(0)
    
    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" })
      
      // Simulate compression progress
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 20
        })
      }, 200)
      
      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        quality: 0.8
      })
      
      clearInterval(progressInterval)
      setCompressionProgress(100)
      
      // Clean up old URLs
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage)
      }
      
      // Create new URL for display
      const compressedImageUrl = URL.createObjectURL(compressedFile)
      setCapturedImage(compressedImageUrl)
      setImageFile(compressedFile)
      setIsCroppingMode(false)
      
      // Identify the processed image
      await identifyImage(compressedFile)
      
      toast.success(`Image processed! Size reduced to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
      
    } catch (error) {
      console.error('Image processing failed:', error)
      toast.error('Failed to process image')
    } finally {
      setIsCompressing(false)
      setCompressionProgress(0)
    }
  }

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please capture/select an image.")
      return
    }
    
    // Prevent submission if human image is detected
    if (isHumanImage) {
      toast.error("Cannot proceed with a human image. Please retake or upload a property image.")
      return
    }

    // Final compression if not already done
    let finalFile = imageFile
    if (finalFile.size > 2 * 1024 * 1024) { // If larger than 2MB
      toast.info("Optimizing image for upload...")
      finalFile = await compressImage(finalFile, { maxSizeMB: 1.5 })
    }

    onImageCaptured(finalFile, identifiedCategory || undefined)
  }

  const handleSkipCrop = async () => {
    if (imageFile) {
      setIsCroppingMode(false)
      await identifyImage(imageFile)
    }
  }

  const handleRetakeImage = () => {
    setCapturedImage(null)
    setImageFile(null)
    setIsCroppingMode(false)
    setDetectedSubject(null)
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setImageFile(null)
    setIsCroppingMode(false)
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
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
              <Target className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className={`text-lg sm:text-xl font-bold truncate ${fromLogin ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                Advanced Property Capture
              </h1>
              {openCVLoaded && (
                <Badge className="ml-3 bg-green-100 text-green-800 border-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
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

          {!capturedImage && !isCapturing && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Capture property images with AI-powered auto-detection, quadrilateral cropping, and perspective correction!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={startCamera}
                    className="flex flex-col items-center p-8 h-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="h-12 w-12 mb-3" />
                    <span className="text-lg font-semibold">Smart Capture</span>
                    <span className="text-sm opacity-90">AI-powered camera</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-8 h-auto border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                  >
                    <Upload className="h-12 w-12 mb-3 text-purple-600" />
                    <span className="text-lg font-semibold text-purple-800">Select & Process</span>
                    <span className="text-sm text-purple-600">Auto-enhance images</span>
                  </Button>
                </div>
              </div>

              {fromLogin && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    Enhanced Features:
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Auto-detect building facades and subjects
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Quadrilateral cropping with perspective correction
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      On-device compression for optimized uploads
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                      Smart analysis with enhanced accuracy
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

              {/* Camera controls overlay - Enhanced */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                <div className="flex items-center gap-8">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    size="lg"
                    className="w-12 h-16 rounded-full bg-black/50 text-white hover:bg-black/70 border-2 border-white/30 flex flex-col items-center justify-center"
                    title="Select from gallery"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs text-white mt-1">Pick</span>
                  </Button>

                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center"
                    title="Capture with auto-detection"
                  >
                    <Target className="h-8 w-8 text-black" />
                  </Button>
                </div>
              </div>

          {/* Enhanced top hint */}
          <div className="absolute top-8 left-0 right-0 flex justify-center">
            <div className="bg-black/70 text-white px-6 py-3 rounded-full text-sm flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Position property in frame • Auto-detection enabled
            </div>
          </div>

          {/* Viewfinder Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-80 h-60 max-w-[80vw] max-h-[50vh]">
              {/* Corner frames */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white rounded-br-xl"></div>
              
              {/* Focus indicator */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full opacity-75 animate-pulse"></div>
            </div>
          </div>
            </div>
          )}

          {/* Cropping mode */}
          {isCroppingMode && capturedImage && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <QuadrilateralCropper
                src={capturedImage}
                onCrop={handleCropComplete}
                onCancel={handleSkipCrop}
                detectedSubject={detectedSubject}
              />
            </div>
          )}

          {/* Auto-detection progress */}
          {isDetectingSubject && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-purple-700 font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Auto-detecting subject...
                </p>
              </div>
              <Progress value={75} className="h-2 bg-purple-100" />
            </div>
          )}

          {/* Compression progress */}
          {isCompressing && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700 font-medium">Optimizing image...</p>
                <p className="text-xs text-blue-600">{compressionProgress}%</p>
              </div>
              <Progress value={compressionProgress} className="h-2 bg-blue-100" />
            </div>
          )}

          {/* Image verification progress */}
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
                    onClick={() => imageFile && identifyImage(imageFile, true)}
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

          {/* Preview with enhanced features */}
          {capturedImage && !isCroppingMode && (
            <div className="space-y-6">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src={capturedImage}
                  alt="Captured property"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
                {identifiedCategory && !isIdentifying && (
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge 
                      className={`${isHumanImage ? 'bg-red-500' : 
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
                    
                    {detectedSubject && (
                      <Badge className="bg-blue-500 text-white border-0 shadow-lg flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        Auto-detected
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Rest of the preview UI remains the same but with enhanced messaging */}
              {!isHumanImage && identifiedCategory && !isIdentifying && !identificationError && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 p-4 rounded-lg border flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      ✅ Advanced processing complete!
                    </p>
                    <p className="text-xs text-green-700">
                      Image optimized with auto-detection, perspective correction, and compression. Ready for AI analysis!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isHumanImage || isIdentifying || !!identificationError}
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold ${(isHumanImage || !!identificationError) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Property
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRetakeImage}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced bottom action area */}
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
                <Zap className="mr-2 h-4 w-4" />
                Continue with AI
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
