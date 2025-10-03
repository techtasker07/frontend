"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crop, 
  RotateCw, 
  Maximize2, 
  Check, 
  X, 
  Move, 
  ZoomIn, 
  ZoomOut,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  Point, 
  DetectedSubject, 
  orderPoints, 
  applyPerspectiveTransform,
  loadOpenCV,
  autoDetectSubject,
  calculateDistance
} from '@/lib/advanced-image-processing'

interface QuadrilateralCropperProps {
  src: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
  className?: string
  detectedSubject?: DetectedSubject | null
}

const HANDLE_SIZE = 12
const MIN_CROP_SIZE = 50

export function QuadrilateralCropper({ 
  src, 
  onCrop, 
  onCancel, 
  className = "",
  detectedSubject: initialDetectedSubject
}: QuadrilateralCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [cropPoints, setCropPoints] = useState<Point[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState(-1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [detectedSubject, setDetectedSubject] = useState<DetectedSubject | null>(initialDetectedSubject || null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [showGrid, setShowGrid] = useState(true)

  // Initialize crop points when image loads
  const initializeCropPoints = useCallback(() => {
    if (!loadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const image = loadedImage
    
    let points: Point[]
    
    if (detectedSubject?.bounds && detectedSubject.bounds.length === 4) {
      // Use detected subject bounds, scaled to canvas size
      const scaleX = canvas.width / image.naturalWidth
      const scaleY = canvas.height / image.naturalHeight
      
      points = detectedSubject.bounds.map(p => ({
        x: p.x * scaleX,
        y: p.y * scaleY
      }))
    } else {
      // Default to a rectangle covering most of the image
      const margin = Math.min(canvas.width, canvas.height) * 0.1
      points = [
        { x: margin, y: margin },
        { x: canvas.width - margin, y: margin },
        { x: canvas.width - margin, y: canvas.height - margin },
        { x: margin, y: canvas.height - margin }
      ]
    }
    
    setCropPoints(orderPoints(points))
  }, [detectedSubject, loadedImage])

  // Auto-detect subject in the image
  const detectSubject = useCallback(async () => {
    if (!loadedImage || isDetecting) return
    
    setIsDetecting(true)
    try {
      const detected = await autoDetectSubject(loadedImage)
      if (detected) {
        setDetectedSubject(detected)
        toast.success(`Auto-detected ${detected.type} (${Math.round(detected.confidence * 100)}% confidence)`)
        
        // Update crop points with detected bounds
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const image = loadedImage
          const scaleX = canvas.width / image.naturalWidth
          const scaleY = canvas.height / image.naturalHeight
          
          const scaledPoints = detected.bounds.map(p => ({
            x: p.x * scaleX,
            y: p.y * scaleY
          }))
          
          setCropPoints(orderPoints(scaledPoints))
        }
      } else {
        toast.info("Couldn't auto-detect subject. Please adjust manually.")
      }
    } catch (error) {
      console.error('Auto-detection failed:', error)
      toast.error("Auto-detection failed. Please adjust crop manually.")
    } finally {
      setIsDetecting(false)
    }
  }, [loadedImage])

// We use a hidden <img> element in the DOM for more reliable mobile loading
// The onLoad handler is attached below in JSX.

  // Load OpenCV on component mount
  useEffect(() => {
    loadOpenCV().catch(console.error)
  }, [])

  // Add timeout for image loading to prevent infinite loading state
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.error('❌ QuadrilateralCropper: Image loading timeout after 10 seconds')
        setIsLoading(false)
        toast.error('Image failed to load. Please try retaking the photo.')
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  // Draw the image and crop overlay
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const image = loadedImage
    
    if (!canvas || !ctx || !image || !imageLoaded) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (cropPoints.length === 4) {
      // Clear crop area
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.moveTo(cropPoints[0].x, cropPoints[0].y)
      for (let i = 1; i < cropPoints.length; i++) {
        ctx.lineTo(cropPoints[i].x, cropPoints[i].y)
      }
      ctx.closePath()
      ctx.fill()
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over'
      
      // Draw grid inside crop area if enabled
      if (showGrid) {
        ctx.save()
        ctx.clip()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        
        // Rule of thirds grid
        const [tl, tr, br, bl] = cropPoints
        
        // Vertical lines
        for (let i = 1; i < 3; i++) {
          const t = i / 3
          const x1 = tl.x + (tr.x - tl.x) * t
          const y1 = tl.y + (tr.y - tl.y) * t
          const x2 = bl.x + (br.x - bl.x) * t
          const y2 = bl.y + (br.y - bl.y) * t
          
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        
        // Horizontal lines
        for (let i = 1; i < 3; i++) {
          const t = i / 3
          const x1 = tl.x + (bl.x - tl.x) * t
          const y1 = tl.y + (bl.y - tl.y) * t
          const x2 = tr.x + (br.x - tr.x) * t
          const y2 = tr.y + (br.y - tr.y) * t
          
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        
        ctx.restore()
      }
      
      // Draw crop border
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cropPoints[0].x, cropPoints[0].y)
      for (let i = 1; i < cropPoints.length; i++) {
        ctx.lineTo(cropPoints[i].x, cropPoints[i].y)
      }
      ctx.closePath()
      ctx.stroke()
      
      // Draw corner handles
      cropPoints.forEach((point, index) => {
        ctx.fillStyle = '#3b82f6'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        
        ctx.beginPath()
        ctx.arc(point.x, point.y, HANDLE_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        
        // Corner labels
        ctx.fillStyle = '#ffffff'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        const labels = ['TL', 'TR', 'BR', 'BL']
        ctx.fillText(labels[index], point.x, point.y - HANDLE_SIZE)
      })
    }
  }, [cropPoints, imageLoaded, showGrid, loadedImage])

  // Redraw when crop points change
  useEffect(() => {
    draw()
  }, [draw])

  // Handle mouse and touch events
  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return { x: 0, y: 0 }
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getEventPos(e)
    
    // Check if clicking/touching on a handle
    for (let i = 0; i < cropPoints.length; i++) {
      const distance = calculateDistance(pos, cropPoints[i])
      if (distance <= HANDLE_SIZE * 2) { // Larger touch target
        setIsDragging(true)
        setDragIndex(i)
        return
      }
    }
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || dragIndex === -1) return
    
    e.preventDefault()
    const pos = getEventPos(e)
    const newPoints = [...cropPoints]
    
    // Constrain to canvas bounds
    pos.x = Math.max(0, Math.min(canvasRef.current?.width || 0, pos.x))
    pos.y = Math.max(0, Math.min(canvasRef.current?.height || 0, pos.y))
    
    newPoints[dragIndex] = pos
    setCropPoints(newPoints)
  }

  const handleEnd = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    setIsDragging(false)
    setDragIndex(-1)
  }

  // Crop the image
  const handleCrop = async () => {
    if (!canvasRef.current || !loadedImage || cropPoints.length !== 4) {
      toast.error('Invalid crop selection')
      return
    }

    setIsTransforming(true)
    try {
      // Convert canvas coordinates back to image coordinates
      const canvas = canvasRef.current
      const image = loadedImage
      const scaleX = image.naturalWidth / canvas.width
      const scaleY = image.naturalHeight / canvas.height
      
      const imagePoints = cropPoints.map(p => ({
        x: p.x * scaleX,
        y: p.y * scaleY
      }))

      // Create a canvas with the original image
      const sourceCanvas = document.createElement('canvas')
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) throw new Error('Failed to get canvas context')
      
      sourceCanvas.width = image.naturalWidth
      sourceCanvas.height = image.naturalHeight
      sourceCtx.drawImage(image, 0, 0)
      
      // Apply perspective transform
      const blob = await applyPerspectiveTransform(
        sourceCanvas,
        orderPoints(imagePoints),
        800, // target width
        600  // target height
      )
      
      toast.success('Image cropped and straightened successfully!')
      onCrop(blob)
      
    } catch (error) {
      console.error('Crop failed:', error)
      toast.error('Failed to crop image')
    } finally {
      setIsTransforming(false)
    }
  }

  // Reset to original detection or default
  const resetCrop = () => {
    initializeCropPoints()
    toast.info('Crop area reset')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading image...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-black ${className}`} ref={containerRef}>
      {/* Canvas for image and crop overlay */}
      <div className="flex items-center justify-center min-h-[400px] p-4 relative">
        {/* Hidden image ensures reliable load events on mobile browsers */}
        <img
          src={src}
          alt="source"
          className="hidden"
          crossOrigin={src.startsWith('http') ? 'anonymous' : undefined}
          onLoad={(e) => {
            console.log('🖼️ QuadrilateralCropper: Image onLoad fired')
            const img = e.currentTarget as HTMLImageElement
            const canvas = canvasRef.current
            if (!canvas) {
              console.error('❌ QuadrilateralCropper: Canvas ref is null')
              return
            }

            console.log('📐 Image dimensions:', img.naturalWidth, 'x', img.naturalHeight)
            const maxSize = 800
            const aspectRatio = img.naturalWidth / img.naturalHeight
            if (aspectRatio > 1) {
              canvas.width = Math.min(maxSize, img.naturalWidth)
              canvas.height = canvas.width / aspectRatio
            } else {
              canvas.height = Math.min(maxSize, img.naturalHeight)
              canvas.width = canvas.height * aspectRatio
            }
            console.log('🎨 Canvas size set to:', canvas.width, 'x', canvas.height)

            setLoadedImage(img)
            setImageLoaded(true)
            setIsLoading(false)
            console.log('✅ QuadrilateralCropper: Loading complete, initializing crop points...')
            // Initialize after next paint
            setTimeout(() => initializeCropPoints(), 50)
          }}
          onError={(e) => {
            console.error('❌ QuadrilateralCropper: Image loading failed', e)
            toast.error('Failed to load image')
            setIsLoading(false)
          }}
        />
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[70vh] cursor-crosshair touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
          />

          {/* Responsive Frame Overlay */}
          {cropPoints.length === 4 && canvasRef.current && (
            <div className="absolute inset-0 pointer-events-none">
              {(() => {
                const canvas = canvasRef.current!
                // Calculate scale factors (displayed size / actual pixel size)
                const scaleX = canvas.offsetWidth / canvas.width
                const scaleY = canvas.offsetHeight / canvas.height

                // Calculate bounding box of crop points in display coordinates
                const minX = Math.min(...cropPoints.map(p => p.x)) * scaleX
                const maxX = Math.max(...cropPoints.map(p => p.x)) * scaleX
                const minY = Math.min(...cropPoints.map(p => p.y)) * scaleY
                const maxY = Math.max(...cropPoints.map(p => p.y)) * scaleY
                const width = maxX - minX
                const height = maxY - minY

                return (
                  <div
                    className="absolute"
                    style={{
                      left: `${minX}px`,
                      top: `${minY}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    {/* Corner frames */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white rounded-br-xl"></div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {detectedSubject && (
            <Badge 
              className={`bg-green-500 text-white`}
            >
              {detectedSubject.type} ({Math.round(detectedSubject.confidence * 100)}%)
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={detectSubject}
            disabled={isDetecting}
            className="text-white hover:bg-white/10"
          >
            {isDetecting ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            {isDetecting ? 'Detecting...' : 'Auto-Detect'}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="text-white hover:bg-white/10"
        >
          Grid
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 right-4 text-center">
        <p className="text-white/80 text-sm">
          Drag the corner handles to adjust the crop area
        </p>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={resetCrop}
            className="text-white hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            disabled={isTransforming || cropPoints.length !== 4}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isTransforming ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isTransforming ? 'Processing...' : 'Crop & Straighten'}
          </Button>
        </div>
      </div>

      {/* Help overlay */}
      {cropPoints.length === 4 && (
        <div className="absolute top-16 left-4 bg-black/70 text-white p-3 rounded-lg text-sm max-w-xs">
          <h4 className="font-semibold mb-2 flex items-center">
            <Move className="w-4 h-4 mr-2" />
            Quadrilateral Crop
          </h4>
          <ul className="space-y-1 text-xs">
            <li>• Drag corners to adjust crop area</li>
            <li>• Auto-detect will find rectangles</li>
            <li>• Perspective correction applies automatically</li>
            <li>• Grid helps with alignment</li>
          </ul>
        </div>
      )}
    </div>
  )
}
