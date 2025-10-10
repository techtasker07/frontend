"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Eye,
  Trash2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import { VirtualTourService, VirtualTourData, VirtualTourScene } from '@/lib/virtual-tour'
import Image from 'next/image'

interface VirtualTourUploadProps {
  propertyId?: string
  propertyTitle?: string
  onTourDataChange?: (tourData: VirtualTourData | null) => void
  disabled?: boolean
}

interface UploadScene {
  id: string
  file: File
  name: string
  description?: string
  preview: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  uploadedUrl?: string
}

export function VirtualTourUpload({
  propertyId,
  propertyTitle = "Property",
  onTourDataChange,
  disabled = false
}: VirtualTourUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tourTitle, setTourTitle] = useState(`${propertyTitle} - Virtual Tour`)
  const [tourDescription, setTourDescription] = useState('')
  const [scenes, setScenes] = useState<UploadScene[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tourData, setTourData] = useState<VirtualTourData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndAddFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach((file, index) => {
      const validation = VirtualTourService.validateImage(file)
      if (validation) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: Invalid image file`)
      }
    })

    if (errors.length > 0) {
      toast.error(`Some files were rejected: ${errors.join(', ')}`)
    }

    if (validFiles.length > 0) {
      const newScenes: UploadScene[] = validFiles.map((file, index) => ({
        id: `scene_${Date.now()}_${index}`,
        file,
        name: `Room ${scenes.length + index + 1}`,
        description: '',
        preview: URL.createObjectURL(file),
        status: 'pending'
      }))

      setScenes(prev => [...prev, ...newScenes])
      toast.success(`Added ${validFiles.length} image(s) to virtual tour`)
    }
  }, [scenes.length])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files)
    }
  }, [validateAndAddFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files)
    }
  }, [validateAndAddFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeScene = useCallback((sceneId: string) => {
    setScenes(prev => {
      const updated = prev.filter(s => s.id !== sceneId)
      // Clean up object URLs
      const removed = prev.find(s => s.id === sceneId)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  const updateScene = useCallback((sceneId: string, updates: Partial<UploadScene>) => {
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ))
  }, [])

  const createVirtualTour = useCallback(async () => {
    if (scenes.length === 0) {
      toast.error('Please add at least one image for the virtual tour')
      return
    }

    if (!tourTitle.trim()) {
      toast.error('Please provide a title for the virtual tour')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload all images
      const files = scenes.map(s => s.file)
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 50) // First 50% for uploads

        try {
          // Optimize image first
          const optimizedFile = await VirtualTourService.optimizeImage(file)

          // Upload optimized image
          const response = await fetch('/api/virtual-tour/upload-images', {
            method: 'POST',
            body: JSON.stringify({
              files: [optimizedFile],
              propertyId: propertyId || 'virtual-tour'
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }

          const result = await response.json()
          if (result.success && result.data?.urls?.length > 0) {
            uploadedUrls.push(result.data.urls[0])
            updateScene(scenes[i].id, { status: 'completed', uploadedUrl: result.data.urls[0] })
          } else {
            throw new Error(result.error || 'Upload failed')
          }
        } catch (error: any) {
          updateScene(scenes[i].id, { status: 'error', error: error.message })
          throw error
        }
      }

      setUploadProgress(50) // Uploads complete

      // Create tour data structure
      const processedScenes: Omit<VirtualTourScene, 'id'>[] = scenes.map((scene, index) => ({
        scene_id: scene.id,
        name: scene.name,
        image_url: uploadedUrls[index] || scene.uploadedUrl!,
        description: scene.description,
        hotspots: []
      }))

      const tourData = VirtualTourService.createTourData(
        propertyId || 'preview',
        tourTitle,
        processedScenes,
        {
          auto_rotate: false,
          zoom_enabled: true,
          navigation_enabled: true,
          controls_visible: true,
          transition_duration: 800
        }
      )

      setUploadProgress(75)

      // Save tour to database if propertyId is provided
      if (propertyId) {
        const response = await fetch('/api/virtual-tour', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...tourData,
            property_id: propertyId
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save virtual tour')
        }

        const savedTour = await response.json()
        setTourData(savedTour.data)
        onTourDataChange?.(savedTour.data)
      } else {
        // Preview mode
        const previewTour = VirtualTourService.generatePreviewTour(tourTitle, uploadedUrls)
        setTourData(previewTour)
        onTourDataChange?.(previewTour)
      }

      setUploadProgress(100)
      toast.success('Virtual tour created successfully!')

      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating virtual tour:', error)
      toast.error(`Failed to create virtual tour: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }, [scenes, tourTitle, propertyId, updateScene, onTourDataChange])

  const resetForm = useCallback(() => {
    setTourTitle(`${propertyTitle} - Virtual Tour`)
    setTourDescription('')
    setScenes([])
    setTourData(null)
    setUploadProgress(0)
    setIsUploading(false)
  }, [propertyTitle])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Clean up object URLs when closing
      scenes.forEach(scene => {
        if (scene.preview) {
          URL.revokeObjectURL(scene.preview)
        }
      })
      resetForm()
    }
  }, [scenes, resetForm])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Create Virtual Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Create Virtual Tour
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tour-title">Tour Title *</Label>
                <Input
                  id="tour-title"
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  placeholder="e.g., Beautiful House Virtual Tour"
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tour-description">Description (Optional)</Label>
                <Textarea
                  id="tour-description"
                  value={tourDescription}
                  onChange={(e) => setTourDescription(e.target.value)}
                  placeholder="Describe your virtual tour..."
                  rows={3}
                  disabled={isUploading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">360° Images</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload panoramic images for your virtual tour. Images should be 360° panoramas for best results.
              </p>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  disabled || isUploading
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {disabled || isUploading ? 'Upload disabled' : 'Drop 360° images here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled || isUploading}
                  />
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP • Max size: 15MB per image
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scene Preview and Management */}
          {scenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tour Scenes ({scenes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenes.map((scene) => (
                    <div key={scene.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-video relative overflow-hidden rounded bg-gray-100">
                        <Image
                          src={scene.preview}
                          alt={scene.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {scene.status === 'completed' && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                          {scene.status === 'error' && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeScene(scene.id)}
                            disabled={isUploading}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Input
                          value={scene.name}
                          onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                          placeholder="Scene name"
                          disabled={isUploading}
                          className="text-sm"
                        />
                        <Textarea
                          value={scene.description || ''}
                          onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          rows={2}
                          disabled={isUploading}
                          className="text-sm"
                        />
                      </div>

                      {scene.error && (
                        <Alert variant="destructive">
                          <AlertDescription className="text-xs">
                            {scene.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Creating Virtual Tour...</span>
                    <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={createVirtualTour}
              disabled={scenes.length === 0 || isUploading || !tourTitle.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Tour...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Virtual Tour
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}