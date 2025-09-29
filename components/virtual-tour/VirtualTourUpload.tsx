"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  X, 
  Plus, 
  Eye, 
  Move,
  Camera,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

interface VirtualTourScene {
  id: string
  name: string
  description?: string
  file?: File
  image_url?: string
  preview_url?: string
  connections: string[] // Array of connected scene IDs
}

interface VirtualTourUploadProps {
  onTourDataChange: (tourData: VirtualTourUploadData) => void
  initialData?: VirtualTourUploadData
  disabled?: boolean
}

export interface VirtualTourUploadData {
  title: string
  scenes: VirtualTourScene[]
  default_scene_id?: string
}

export function VirtualTourUpload({ onTourDataChange, initialData, disabled = false }: VirtualTourUploadProps) {
  const [tourData, setTourData] = useState<VirtualTourUploadData>(
    initialData || { title: '', scenes: [] }
  )
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [draggedScene, setDraggedScene] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTitleChange = (title: string) => {
    const newData = { ...tourData, title }
    setTourData(newData)
    onTourDataChange(newData)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newScenes: VirtualTourScene[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        continue
      }

      // Create preview URL
      const preview_url = URL.createObjectURL(file)
      
      const sceneId = `scene_${Date.now()}_${i}`
      const sceneName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ')

      newScenes.push({
        id: sceneId,
        name: sceneName,
        file,
        preview_url,
        connections: []
      })
    }

    if (newScenes.length > 0) {
      const updatedData = {
        ...tourData,
        scenes: [...tourData.scenes, ...newScenes],
        // Set first scene as default if none exists
        default_scene_id: tourData.default_scene_id || newScenes[0]?.id
      }
      setTourData(updatedData)
      onTourDataChange(updatedData)
      toast.success(`Added ${newScenes.length} scene(s) to your virtual tour`)
    }
  }

  const updateScene = (sceneId: string, updates: Partial<VirtualTourScene>) => {
    const updatedData = {
      ...tourData,
      scenes: tourData.scenes.map(scene => 
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    }
    setTourData(updatedData)
    onTourDataChange(updatedData)
  }

  const removeScene = (sceneId: string) => {
    const updatedData = {
      ...tourData,
      scenes: tourData.scenes.filter(scene => scene.id !== sceneId),
      // Update default scene if removed
      default_scene_id: tourData.default_scene_id === sceneId 
        ? tourData.scenes.find(s => s.id !== sceneId)?.id 
        : tourData.default_scene_id
    }
    
    // Remove connections to deleted scene
    updatedData.scenes = updatedData.scenes.map(scene => ({
      ...scene,
      connections: scene.connections.filter(connId => connId !== sceneId)
    }))

    setTourData(updatedData)
    onTourDataChange(updatedData)
    toast.success('Scene removed from tour')
  }

  const setDefaultScene = (sceneId: string) => {
    const updatedData = { ...tourData, default_scene_id: sceneId }
    setTourData(updatedData)
    onTourDataChange(updatedData)
    toast.success('Default scene updated')
  }

  const toggleConnection = (fromSceneId: string, toSceneId: string) => {
    const fromScene = tourData.scenes.find(s => s.id === fromSceneId)
    if (!fromScene) return

    const isConnected = fromScene.connections.includes(toSceneId)
    const newConnections = isConnected
      ? fromScene.connections.filter(id => id !== toSceneId)
      : [...fromScene.connections, toSceneId]

    updateScene(fromSceneId, { connections: newConnections })
  }

  const validateTour = (): string[] => {
    const errors: string[] = []
    
    if (!tourData.title.trim()) {
      errors.push('Tour title is required')
    }
    
    if (tourData.scenes.length === 0) {
      errors.push('At least one scene is required')
    }
    
    if (tourData.scenes.length > 20) {
      errors.push('Maximum 20 scenes allowed per tour')
    }
    
    // Check for unnamed scenes
    const unnamedScenes = tourData.scenes.filter(scene => !scene.name.trim())
    if (unnamedScenes.length > 0) {
      errors.push(`${unnamedScenes.length} scene(s) need names`)
    }

    return errors
  }

  const errors = validateTour()
  const isValid = errors.length === 0

  return (
    <div className="space-y-6">
      {/* Tour Title */}
      <div className="space-y-2">
        <Label htmlFor="tour-title">Virtual Tour Title *</Label>
        <Input
          id="tour-title"
          value={tourData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g., Beautiful 3-Bedroom House Tour"
          disabled={disabled}
        />
      </div>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Upload 360° Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro tip:</strong> Use 360° panoramic images for the best virtual tour experience. 
                Regular wide-angle photos will also work but may not provide the full immersive effect.
              </AlertDescription>
            </Alert>

            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
              onDrop={(e) => {
                e.preventDefault()
                handleFileSelect(e.dataTransfer.files)
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Drop 360° images here or click to upload
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports JPEG, PNG • Max 10MB per image • Up to 20 scenes
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || tourData.scenes.length >= 20}
              >
                <Plus className="mr-2 h-4 w-4" />
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={disabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenes List */}
      {tourData.scenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Tour Scenes ({tourData.scenes.length})
              </span>
              {tourData.scenes.length > 1 && (
                <Badge variant="secondary">
                  {tourData.scenes.length} rooms connected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tourData.scenes.map((scene, index) => (
                <Card key={scene.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Scene Preview */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                        {scene.preview_url || scene.image_url ? (
                          <img
                            src={scene.preview_url || scene.image_url}
                            alt={scene.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {tourData.default_scene_id === scene.id && (
                        <Badge className="absolute -top-2 -right-2 text-xs">
                          Start
                        </Badge>
                      )}
                    </div>

                    {/* Scene Details */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`scene-name-${scene.id}`}>Room Name</Label>
                          <Input
                            id={`scene-name-${scene.id}`}
                            value={scene.name}
                            onChange={(e) => updateScene(scene.id, { name: e.target.value })}
                            placeholder="e.g., Living Room"
                            disabled={disabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`scene-desc-${scene.id}`}>Description (optional)</Label>
                          <Input
                            id={`scene-desc-${scene.id}`}
                            value={scene.description || ''}
                            onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                            placeholder="Brief description of this room"
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      {/* Scene Actions */}
                      <div className="flex items-center space-x-2">
                        {tourData.default_scene_id !== scene.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultScene(scene.id)}
                            disabled={disabled}
                          >
                            Set as Start
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeScene(scene.id)}
                          disabled={disabled}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>

                      {/* Connections */}
                      {tourData.scenes.length > 1 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Connected Rooms ({scene.connections.length})
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {tourData.scenes
                              .filter(s => s.id !== scene.id)
                              .map(otherScene => (
                                <Button
                                  key={otherScene.id}
                                  variant={scene.connections.includes(otherScene.id) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleConnection(scene.id, otherScene.id)}
                                  disabled={disabled}
                                  className="text-xs"
                                >
                                  <Move className="h-3 w-3 mr-1" />
                                  {otherScene.name || `Scene ${tourData.scenes.indexOf(otherScene) + 1}`}
                                </Button>
                              ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Select which rooms visitors can navigate to from this room
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tour Summary */}
      {isValid && tourData.scenes.length > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Virtual Tour Ready!</p>
              <div className="text-sm space-y-1">
                <p>• <strong>{tourData.scenes.length}</strong> scenes configured</p>
                <p>• Starting scene: <strong>{tourData.scenes.find(s => s.id === tourData.default_scene_id)?.name}</strong></p>
                <p>• Total connections: <strong>{tourData.scenes.reduce((acc, s) => acc + s.connections.length, 0)}</strong></p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([sceneId, progress]) => {
                const scene = tourData.scenes.find(s => s.id === sceneId)
                return (
                  <div key={sceneId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{scene?.name || 'Unknown scene'}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
