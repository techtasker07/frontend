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

          {/* Enhanced Responsive Frame Overlay */}
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
                  <>
                    {/* Crop area highlight */}
                    <div
                      className="absolute border-2 border-white/60 bg-white/5 backdrop-blur-sm"
                      style={{
                        left: `${minX}px`,
                        top: `${minY}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                    >
                      {/* Corner frames - Enhanced */}
                      <div className="absolute -top-2 -left-2 w-12 h-12 border-l-4 border-t-4 border-white drop-shadow-lg rounded-tl-xl bg-blue-600/20"></div>
                      <div className="absolute -top-2 -right-2 w-12 h-12 border-r-4 border-t-4 border-white drop-shadow-lg rounded-tr-xl bg-blue-600/20"></div>
                      <div className="absolute -bottom-2 -left-2 w-12 h-12 border-l-4 border-b-4 border-white drop-shadow-lg rounded-bl-xl bg-blue-600/20"></div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 border-r-4 border-b-4 border-white drop-shadow-lg rounded-br-xl bg-blue-600/20"></div>
                      
                      {/* Center focus point */}
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-full h-full bg-white rounded-full opacity-90 animate-pulse drop-shadow-lg"></div>
                      </div>
                    </div>
                  </>
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

      {/* Enhanced Instructions */}
      <div className="absolute bottom-20 left-4 right-4 text-center">
        <div className="bg-black/70 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-center gap-2">
            <Move className="w-4 h-4" />
            <span>Drag corner handles to adjust • Auto-detect available</span>
          </div>
        </div>
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

      {/* Enhanced Help overlay */}
      {cropPoints.length === 4 && (
        <div className="absolute top-16 left-4 bg-black/80 text-white p-4 rounded-xl text-sm max-w-xs backdrop-blur-sm border border-white/20">
          <h4 className="font-semibold mb-3 flex items-center text-blue-300">
            <Crop className="w-4 h-4 mr-2" />
            Smart Crop Mode
          </h4>
          <ul className="space-y-2 text-xs text-white/90">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Drag blue corners to adjust
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Auto-perspective correction
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Grid guides alignment
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Focus on key area
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
