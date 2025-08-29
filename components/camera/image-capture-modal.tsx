"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, CheckCircle } from "lucide-react"
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
      <DialogContent className={`max-w-md ${fromLogin ? 'border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50' : ''}`}>
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
            <div className="space-y-4">
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
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
