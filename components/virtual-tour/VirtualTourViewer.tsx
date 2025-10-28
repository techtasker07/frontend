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

    // ensure container has a stable explicit height so the viewer can compute layout
    viewerRef.current.style.height = '100%'

    // destroy existing viewer (but prefer destroying the local instance we create)
    if (viewer) {
      try { viewer.destroy() } catch (e) { /* noop */ }
      setViewer(null)
    }

    // keep local reference so cleanup destroys exactly what we created
    let localViewer: any = null

    const loadViewerModules = async () => {
      const candidates = [
        // common possibilities depending on installed version
        { viewer: 'photo-sphere-viewer', markers: '@photo-sphere-viewer/markers-plugin', gyro: '@photo-sphere-viewer/gyroscope-plugin' },
        { viewer: '@photo-sphere-viewer/core', markers: '@photo-sphere-viewer/markers-plugin', gyro: '@photo-sphere-viewer/gyroscope-plugin' }
      ]

      for (const c of candidates) {
        try {
          const [vMod, mMod, gMod] = await Promise.all([
            import(/* webpackChunkName: "psv-core" */ c.viewer),
            import(/* webpackChunkName: "psv-markers" */ c.markers),
            import(/* webpackChunkName: "psv-gyro" */ c.gyro)
          ])

          console.debug('VirtualTour: loaded module keys', {
            viewer: Object.keys(vMod || {}),
            markers: Object.keys(mMod || {}),
            gyro: Object.keys(gMod || {})
          })

          const ViewerCtor = (vMod as any).Viewer || (vMod as any).default || (vMod as any).PhotoSphereViewer || (vMod as any)
          const MarkersPluginCtor = (mMod as any).MarkersPlugin || (mMod as any).default || (mMod as any)
          const GyroPluginCtor = (gMod as any).GyroscopePlugin || (gMod as any).default || (gMod as any)

          if (ViewerCtor) return { Viewer: ViewerCtor, MarkersPlugin: MarkersPluginCtor, GyroscopePlugin: GyroPluginCtor }
        } catch (err) {
          console.warn('VirtualTour: module candidate failed to import', c.viewer, err)
          // continue to next candidate
        }
      }

      throw new Error('Could not load PhotoSphere viewer modules — check package installation/version')
    }

    loadViewerModules().then(async ({ Viewer, MarkersPlugin, GyroscopePlugin }: any) => {
      try {
        const imgUrl = currentScene.image_url
        if (!imgUrl) throw new Error('Scene image_url is missing')

        // best-effort check that the image is reachable (HEAD)
        try {
          const head = await fetch(imgUrl, { method: 'HEAD' })
          if (!head.ok) console.warn('VirtualTour: image HEAD returned non-OK', head.status, imgUrl)
        } catch (e) {
          console.warn('VirtualTour: image HEAD check failed (network/CORS?)', e, imgUrl)
        }

        // create viewer
        localViewer = new Viewer({
          container: viewerRef.current!,
          panorama: imgUrl,
          caption: currentScene.name,
          loadingImg: '/loading-tour.gif',
          defaultLat: 0,
          defaultLong: 0,
          defaultZoomLvl: 50,
          minFov: 30,
          maxFov: 90,
          mousewheel: true,
          mousemove: true,
          plugins: [
            MarkersPlugin ? [MarkersPlugin, { createMarker: (m: any) => m }] : undefined,
            GyroscopePlugin ? [GyroscopePlugin, {}] : undefined
          ].filter(Boolean),
        })

        // expose to state so controls still work
        setViewer(localViewer)

        // Attach markers if available
        if (currentScene.hotspots && currentScene.hotspots.length && MarkersPlugin) {
          try {
            const markersPlugin = localViewer.getPlugin(MarkersPlugin)
            currentScene.hotspots.forEach(h => {
              markersPlugin.addMarker({
                id: h.id,
                longitude: h.position.yaw,
                latitude: h.position.pitch,
                image: '/hotspot-icon.png',
                width: 32,
                height: 32,
                anchor: 'center center',
                data: { target: h.target_scene_id },
              })
            })

            localViewer.on('select-marker', (e: any, marker: any) => {
              const targetId = marker.data?.target
              if (targetId) {
                // navigate by updating state (will trigger effect)
                setCurrentScene((prev) => {
                  if (prev?.id === targetId) return prev
                  const scene = tourData.scenes.find(s => s.id === targetId) || prev
                  toast.success(`Moved to ${scene?.name || 'scene'}`)
                  return scene
                })
              }
            })
          } catch (err) {
            console.warn('VirtualTour: error attaching markers', err)
          }
        }

        // ensure viewer computes layout after mount / dialog animation
        setTimeout(() => {
          try { localViewer.resize() } catch (e) { /* noop */ }
        }, 120) // small delay for dialog open animation

        // start autorotate if available (optional)
        try { if (typeof localViewer.startAutorotate === 'function') localViewer.startAutorotate() } catch (e) { /* noop */ }

        setIsLoading(false)
      } catch (error: any) {
        console.error('Error initializing virtual tour viewer:', error, error?.stack)
        toast.error(`Failed to load virtual tour: ${error?.message || 'unknown error'}`)
        setIsLoading(false)
      }
    }).catch((error: any) => {
      console.error('Error loading PhotoSphere viewer modules:', error, error?.stack)
      toast.error(`Virtual tour not supported: ${error?.message || 'module load failed'}`)
      setIsLoading(false)
    })

    // cleanup: destroy the specific viewer instance we created
    return () => {
      try {
        if (localViewer && typeof localViewer.destroy === 'function') localViewer.destroy()
      } catch (e) { /* noop */ }
    }
  }, [isOpen, tourData, currentScene])

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (viewer && viewerRef.current) {
        try { viewer.resize() } catch (e) { console.warn('VirtualTour: resize failed', e) }
      }
    }

    const handleFullscreenChange = () => {
      if (viewer && viewerRef.current) {
        try { viewer.resize() } catch (e) { console.warn('VirtualTour: resize failed', e) }
      }
    }

    // call resize when dialog opens (small delay)
    if (isOpen) {
      setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [viewer, isOpen])

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
            style={{ height: '100%' }}
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
                <strong>Controls:</strong> Drag to look around • Scroll to zoom • Click markers to navigate • Device orientation enabled
              </p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Full-screen presentation-style image viewer with smooth transitions
export function ImageTourViewer({ images, isOpen, onClose }: {
  images: string[]
  isOpen: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setIsTransitioning(false)
    }, 150)
  }

  const prevImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setIsTransitioning(false)
    }, 150)
  }

  const goToImage = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextImage()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-screen h-screen p-0 bg-black">
        <div className="relative w-full h-full bg-black overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-xl font-semibold">Property Gallery</h2>
                <p className="text-sm text-gray-300">{currentIndex + 1} of {images.length} photos</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Image Display */}
          <div
            className="w-full h-full flex items-center justify-center relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={`relative w-full h-full transition-opacity duration-300 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <img
                src={images[currentIndex]}
                alt={`Property image ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Loading indicator during transition */}
            {isTransitioning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-center space-x-2 overflow-x-auto max-w-full">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    disabled={isTransitioning}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentIndex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-white/20"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
              Use arrow keys or swipe to navigate • Press ESC to close
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
