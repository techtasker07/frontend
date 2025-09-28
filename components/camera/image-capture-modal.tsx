"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, CheckCircle, ZoomIn, ZoomOut } from "lucide-react"
import { toast } from "sonner"
import { identifyImageCategory, type IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface ImageCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onImageCaptured: (imageFile: File) => void
  fromLogin?: boolean
}

export function ImageCaptureModal({ isOpen, onClose, onImageCaptured, fromLogin = false }: ImageCaptureModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
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
    setZoomLevel(1)
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1))
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      // Viewfinder dimensions (256x256 pixels, centered)
      const viewfinderSize = 256
      const cropX = (video.videoWidth - viewfinderSize) / 2
      const cropY = (video.videoHeight - viewfinderSize) / 2
      const cropWidth = viewfinderSize
      const cropHeight = viewfinderSize

      canvas.width = cropWidth
      canvas.height = cropHeight

      if (context) {
        // Draw only the cropped portion
        context.drawImage(
          video,
          cropX, cropY, cropWidth, cropHeight, // Source rectangle
          0, 0, cropWidth, cropHeight // Destination rectangle
        )
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `prospect-${Date.now()}.jpg`, { type: "image/jpeg" })
              const imageUrl = URL.createObjectURL(blob)
              setCapturedImage(imageUrl)
              setImageFile(file)
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      setCapturedImage(imageUrl)
      setImageFile(file)
    } else {
      toast.error("Please select a valid image file.")
    }
  }

  const handleSubmit = () => {
    if (!imageFile) {
      toast.error("Please capture/select an image.")
      return
    }

    onImageCaptured(imageFile)
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setImageFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isCapturing ? 'fixed inset-0 w-screen h-screen max-w-none p-0 border-0' : `max-w-md ${fromLogin ? 'border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50' : ''}`}`}>
        {!isCapturing && (
          <DialogHeader>
            <DialogTitle className={`flex items-center ${fromLogin ? 'text-xl font-bold' : ''}`}>
              <Camera className={`mr-2 h-5 w-5 ${fromLogin ? 'text-purple-600' : ''}`} />
              {fromLogin ? (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Capture Property Image
                </span>
              ) : (
                'Capture Property Image'
              )}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="space-y-4">
          {!capturedImage && !isCapturing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a photo or select an image of a property to get AI-powered prospect analysis!
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={startCamera} className="flex flex-col items-center p-6 h-auto">
                  <Camera className="h-8 w-8 mb-2" />
                  Take Photo
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center p-6 h-auto"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  Select Image
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
          )}

          {isCapturing && (
            <div className="relative w-full h-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{
                  transform: `scaleX(-1) scale(${zoomLevel})`,
                  transformOrigin: 'center'
                }} // Mirror and zoom the video
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-64 h-64 border-2 border-white rounded-lg opacity-80">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-white"></div>
                  </div>
                </div>
              </div>

              {/* Top controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopCamera}
                    className="bg-black/50 text-white hover:bg-black/70 border-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-1 bg-black/50 rounded-full p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomOut}
                      disabled={zoomLevel <= 1}
                      className="text-white hover:bg-white/20 border-0 h-8 w-8 p-0 disabled:opacity-50"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-xs px-2">{zoomLevel}x</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={zoomIn}
                      disabled={zoomLevel >= 3}
                      className="text-white hover:bg-white/20 border-0 h-8 w-8 p-0 disabled:opacity-50"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  Position property in frame
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-white shadow-lg"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured property"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCapturedImage(null)
                    setImageFile(null)
                  }}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>✨ Smart Analysis</strong>
                </p>
                <p className="text-xs text-blue-700">
                  Our AI will analyze your property image and generate 5 diverse investment prospects across different categories automatically.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  Analyze Property
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
