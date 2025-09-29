"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Home,
  ChevronLeft,
  ChevronRight,
  Map,
  Eye,
  Navigation
} from "lucide-react"
import { toast } from "sonner"

// Virtual tour scene interface
interface VirtualTourScene {
  id: string
  name: string
  image_url: string
  description?: string
  hotspots?: VirtualTourHotspot[]
}

interface VirtualTourHotspot {
  id: string
  target_scene_id: string
  position: { yaw: number; pitch: number }
  title: string
  description?: string
}

interface VirtualTourData {
  id: string
  title: string
  scenes: VirtualTourScene[]
  default_scene_id?: string
}

interface VirtualTourViewerProps {
  tourData: VirtualTourData | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function VirtualTourViewer({ tourData, isOpen, onClose, className }: VirtualTourViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [currentScene, setCurrentScene] = useState<VirtualTourScene | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewer, setViewer] = useState<any>(null)
  const [showSceneMap, setShowSceneMap] = useState(false)

  // Initialize PhotoSphere viewer
  useEffect(() => {
    if (!isOpen || !tourData || !viewerRef.current || !currentScene) return

    setIsLoading(true)

    // Dynamically import PhotoSphere viewer to avoid SSR issues
    import('photo-sphere-viewer').then(({ Viewer }) => {
      try {
        const newViewer = new Viewer({
          container: viewerRef.current!,
          panorama: currentScene.image_url,
          caption: currentScene.name,
          loadingImg: '/loading-tour.gif', // You can add a loading gif
          defaultZoomLvl: 50,
          minFov: 30,
          maxFov: 90,
          mousewheel: true,
          mousemove: true,
          keyboard: {
            'ArrowUp': 'rotateLatUp',
            'ArrowDown': 'rotateLatDown',
            'ArrowRight': 'rotateLongRight',
            'ArrowLeft': 'rotateLongLeft',
            'PageUp': 'zoomIn',
            'PageDown': 'zoomOut',
            '+': 'zoomIn',
            '-': 'zoomOut',
            ' ': 'toggleAutorotate',
          },
          // Add hotspots for navigation
          plugins: [],
        })

        // Add click handler for hotspots
        newViewer.on('click', (e: any) => {
          // Handle hotspot clicks for navigation
          if (currentScene.hotspots) {
            currentScene.hotspots.forEach(hotspot => {
              // Simple distance-based hotspot detection
              const distance = Math.sqrt(
                Math.pow(e.data.yaw - hotspot.position.yaw, 2) + 
                Math.pow(e.data.pitch - hotspot.position.pitch, 2)
              )
              
              if (distance < 0.5) { // Threshold for hotspot detection
                navigateToScene(hotspot.target_scene_id)
              }
            })
          }
        })

        setViewer(newViewer)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing virtual tour viewer:', error)
        toast.error('Failed to load virtual tour')
        setIsLoading(false)
      }
    }).catch(error => {
      console.error('Error loading PhotoSphere viewer:', error)
      toast.error('Virtual tour not supported in this browser')
      setIsLoading(false)
    })

    return () => {
      if (viewer) {
        viewer.destroy()
      }
    }
  }, [isOpen, tourData, currentScene])

  // Set initial scene
  useEffect(() => {
    if (tourData && !currentScene) {
      const defaultScene = tourData.scenes.find(s => s.id === tourData.default_scene_id) || tourData.scenes[0]
      if (defaultScene) {
        setCurrentScene(defaultScene)
      }
    }
  }, [tourData])

  const navigateToScene = (sceneId: string) => {
    const scene = tourData?.scenes.find(s => s.id === sceneId)
    if (scene && scene !== currentScene) {
      setCurrentScene(scene)
      toast.success(`Moved to ${scene.name}`)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const resetView = () => {
    if (viewer) {
      viewer.animate({ yaw: 0, pitch: 0, zoom: 50 })
    }
  }

  const goToFirstScene = () => {
    if (tourData?.scenes[0]) {
      setCurrentScene(tourData.scenes[0])
    }
  }

  if (!tourData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {/* Header */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-lg font-semibold">
                {tourData.title} - Virtual Tour
                {currentScene && (
                  <Badge variant="secondary" className="ml-3">
                    {currentScene.name}
                  </Badge>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Main Viewer */}
          <div 
            ref={viewerRef} 
            className="w-full h-full"
            style={{ minHeight: '500px' }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading Virtual Tour...</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToFirstScene}
                  className="bg-black/60 backdrop-blur-sm text-white border-white/20"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetView}
                  className="bg-black/60 backdrop-blur-sm text-white border-white/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
              </div>

              {/* Center - Scene Navigation */}
              {tourData.scenes.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSceneMap(!showSceneMap)}
                    className="bg-black/60 backdrop-blur-sm text-white border-white/20"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Rooms ({tourData.scenes.length})
                  </Button>
                </div>
              )}

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-black/60 backdrop-blur-sm text-white border-white/20"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Scene Map/Navigator */}
          {showSceneMap && (
            <Card className="absolute top-20 right-4 w-80 max-h-96 overflow-y-auto z-20 bg-black/90 backdrop-blur-sm border-white/20">
              <div className="p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Navigation className="h-4 w-4 mr-2" />
                  Tour Navigation
                </h3>
                <div className="space-y-2">
                  {tourData.scenes.map((scene) => (
                    <Button
                      key={scene.id}
                      variant={currentScene?.id === scene.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => navigateToScene(scene.id)}
                      className="w-full justify-start text-left text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{scene.name}</div>
                        {scene.description && (
                          <div className="text-xs text-gray-300 truncate">{scene.description}</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <div className="absolute top-20 left-4 z-10">
            <Card className="bg-black/60 backdrop-blur-sm border-white/20 p-3">
              <p className="text-white text-sm">
                <strong>Controls:</strong> Drag to look around • Scroll to zoom • Click hotspots to navigate
              </p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Simple 2D fallback viewer for regular images
export function ImageTourViewer({ images, isOpen, onClose }: {
  images: string[]
  isOpen: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-lg font-semibold">
                Property Images ({currentIndex + 1} of {images.length})
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="w-full h-full flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevImage}
                className="bg-black/60 backdrop-blur-sm text-white border-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm bg-black/60 backdrop-blur-sm px-3 py-1 rounded">
                {currentIndex + 1} / {images.length}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextImage}
                className="bg-black/60 backdrop-blur-sm text-white border-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
