"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Camera, 
  X, 
  RotateCcw, 
  Upload, 
  Zap, 
  Focus,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface SmartCameraCaptureProps {
  onImageCapture?: (imageData: string) => void
  onClose?: () => void
}

export function SmartCamerCapture({ onImageCapture, onClose }: SmartCameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Unable to access camera. Please check permissions.")
      setShowUpload(true)
    }
  }, [])

  useEffect(() => {
    initializeCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [initializeCamera, stream])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    
    // Stop video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    
    setIsCapturing(false)
    startAnalysis(imageData)
  }, [stream])

  const startAnalysis = async (imageData: string) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis with a delay
    setTimeout(() => {
      setAnalysisComplete(true)
      setIsAnalyzing(false)
      toast.success("Image analyzed successfully!")
      
      if (onImageCapture) {
        onImageCapture(imageData)
      } else {
        router.push(`/ai/property-details?image=${encodeURIComponent(imageData)}`)
      }
    }, 2000)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setAnalysisComplete(false)
    initializeCamera()
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setCapturedImage(imageData)
      setShowUpload(false)
      startAnalysis(imageData)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <h1 className="text-white font-semibold">Smart Property Capture</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUpload(!showUpload)}
            className="text-white hover:bg-white/20"
          >
            <Upload className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {!capturedImage ? (
          <>
            {/* Camera View */}
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Corner Frames (Google Lens Style) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                  {/* Top Left Corner */}
                  <div className="absolute top-20 left-6">
                    <div className="w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg opacity-80"></div>
                  </div>
                  
                  {/* Top Right Corner */}
                  <div className="absolute top-20 right-6">
                    <div className="w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg opacity-80"></div>
                  </div>
                  
                  {/* Bottom Left Corner */}
                  <div className="absolute bottom-32 left-6">
                    <div className="w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg opacity-80"></div>
                  </div>
                  
                  {/* Bottom Right Corner */}
                  <div className="absolute bottom-32 right-6">
                    <div className="w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg opacity-80"></div>
                  </div>
                  
                  {/* Center Focus Indicator */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center"
                    >
                      <Focus className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-40 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium bg-black/50 rounded-lg px-4 py-2 mx-4">
                  Position your property within the frame
                </p>
              </div>
            </div>

            {/* Upload Overlay */}
            <AnimatePresence>
              {showUpload && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
                >
                  <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Property Image
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop or click to select
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        Choose Image
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Captured Image Preview */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured property"
              className="w-full h-full object-cover"
            />
            
            {/* Analysis Overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Analyzing Property...
                    </h3>
                    <p className="text-white/80">
                      Our AI is examining your property for potential uses
                    </p>
                  </div>
                </motion.div>
              )}
              
              {analysisComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center"
                >
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Analysis Complete!
                    </h3>
                    <p className="text-white/80 mb-4">
                      Ready to generate property prospects
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-6">
          {!capturedImage ? (
            /* Capture Button */
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={captureImage}
                disabled={isCapturing}
                className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 text-black p-0"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </motion.div>
          ) : (
            /* Retake/Continue Controls */
            <div className="flex items-center space-x-4">
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              {analysisComplete && (
                <Button
                  onClick={() => {
                    if (onImageCapture) {
                      onImageCapture(capturedImage)
                    } else {
                      router.push(`/ai/property-details?image=${encodeURIComponent(capturedImage)}`)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="hidden"
        aria-label="Upload property image"
      />

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
