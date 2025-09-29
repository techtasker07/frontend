// Virtual Tour Service - Utilities for processing and managing virtual tours

import { api } from './api'

export interface VirtualTourScene {
  id: string
  name: string
  image_url: string
  description?: string
  position?: { x: number; y: number; z: number }
  hotspots?: VirtualTourHotspot[]
}

export interface VirtualTourHotspot {
  id: string
  target_scene_id: string
  position: { yaw: number; pitch: number }
  title: string
  description?: string
  type?: 'navigation' | 'info' | 'media'
}

export interface VirtualTourData {
  id: string
  property_id: string
  title: string
  description?: string
  scenes: VirtualTourScene[]
  default_scene_id?: string
  settings?: VirtualTourSettings
  created_at: string
  updated_at: string
}

export interface VirtualTourSettings {
  auto_rotate?: boolean
  auto_rotate_speed?: number
  zoom_enabled?: boolean
  navigation_enabled?: boolean
  controls_visible?: boolean
  background_music?: string
  transition_duration?: number
}

// Virtual Tour Processing Service
export class VirtualTourService {
  /**
   * Upload and process virtual tour images
   */
  static async uploadTourImages(files: File[], propertyId: string): Promise<string[]> {
    const uploadedUrls: string[] = []
    
    for (const file of files) {
      try {
        // Validate image
        if (!this.validateImage(file)) {
          throw new Error(`Invalid image: ${file.name}`)
        }

        // Upload to storage
        const response = await api.uploadFile(file)
        if (response.success) {
          uploadedUrls.push(response.data.url)
        } else {
          throw new Error(`Upload failed: ${file.name}`)
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    }

    return uploadedUrls
  }

  /**
   * Validate image file for virtual tour
   */
  static validateImage(file: File): boolean {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return false
    }

    // Check file size (max 15MB)
    const maxSize = 15 * 1024 * 1024
    if (file.size > maxSize) {
      return false
    }

    return true
  }

  /**
   * Generate optimal hotspots based on image analysis
   */
  static generateSuggestedHotspots(scenes: VirtualTourScene[]): VirtualTourHotspot[] {
    const hotspots: VirtualTourHotspot[] = []

    scenes.forEach((scene, index) => {
      // Create navigation hotspots to other scenes
      const otherScenes = scenes.filter(s => s.id !== scene.id)
      
      otherScenes.forEach((targetScene, targetIndex) => {
        // Calculate suggested positions based on scene relationships
        const yaw = (targetIndex * (360 / otherScenes.length)) * (Math.PI / 180)
        const pitch = 0 // Neutral pitch for navigation

        hotspots.push({
          id: `${scene.id}-to-${targetScene.id}`,
          target_scene_id: targetScene.id,
          position: { yaw, pitch },
          title: `Go to ${targetScene.name}`,
          description: `Navigate to ${targetScene.name}`,
          type: 'navigation'
        })
      })
    })

    return hotspots
  }

  /**
   * Create virtual tour data structure
   */
  static createTourData(
    propertyId: string,
    title: string,
    scenes: Omit<VirtualTourScene, 'id'>[],
    settings?: Partial<VirtualTourSettings>
  ): Omit<VirtualTourData, 'id' | 'created_at' | 'updated_at'> {
    const processedScenes: VirtualTourScene[] = scenes.map((scene, index) => ({
      ...scene,
      id: `scene_${Date.now()}_${index}`,
      hotspots: scene.hotspots || []
    }))

    // Auto-generate connections if not provided
    processedScenes.forEach(scene => {
      if (!scene.hotspots?.length) {
        scene.hotspots = this.generateSuggestedHotspots([scene])
          .filter(h => processedScenes.some(s => s.id === h.target_scene_id))
      }
    })

    return {
      property_id: propertyId,
      title,
      scenes: processedScenes,
      default_scene_id: processedScenes[0]?.id,
      settings: {
        auto_rotate: false,
        auto_rotate_speed: 2,
        zoom_enabled: true,
        navigation_enabled: true,
        controls_visible: true,
        transition_duration: 1000,
        ...settings
      }
    }
  }

  /**
   * Optimize image for 360 viewing
   */
  static async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          // Set optimal dimensions for 360 images (2:1 ratio)
          const maxWidth = 4096
          const aspectRatio = img.width / img.height
          
          let newWidth = Math.min(img.width, maxWidth)
          let newHeight = newWidth / aspectRatio

          // Ensure proper 2:1 ratio for equirectangular projection
          if (aspectRatio !== 2) {
            newHeight = newWidth / 2
          }

          canvas.width = newWidth
          canvas.height = newHeight

          // Draw and compress
          ctx?.drawImage(img, 0, 0, newWidth, newHeight)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(optimizedFile)
            } else {
              reject(new Error('Failed to optimize image'))
            }
          }, 'image/jpeg', 0.85)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calculate tour statistics
   */
  static calculateTourStats(tourData: VirtualTourData) {
    return {
      total_scenes: tourData.scenes.length,
      total_hotspots: tourData.scenes.reduce((acc, scene) => acc + (scene.hotspots?.length || 0), 0),
      average_connections: tourData.scenes.reduce((acc, scene) => acc + (scene.hotspots?.length || 0), 0) / tourData.scenes.length,
      estimated_duration: Math.ceil(tourData.scenes.length * 1.5), // minutes
      navigation_complexity: this.calculateNavigationComplexity(tourData.scenes)
    }
  }

  /**
   * Calculate navigation complexity score
   */
  private static calculateNavigationComplexity(scenes: VirtualTourScene[]): 'simple' | 'moderate' | 'complex' {
    const avgConnections = scenes.reduce((acc, scene) => acc + (scene.hotspots?.length || 0), 0) / scenes.length
    
    if (avgConnections <= 2) return 'simple'
    if (avgConnections <= 4) return 'moderate'
    return 'complex'
  }

  /**
   * Validate tour data structure
   */
  static validateTourData(tourData: Partial<VirtualTourData>): string[] {
    const errors: string[] = []

    if (!tourData.title?.trim()) {
      errors.push('Tour title is required')
    }

    if (!tourData.scenes?.length) {
      errors.push('At least one scene is required')
    }

    if (tourData.scenes && tourData.scenes.length > 25) {
      errors.push('Maximum 25 scenes allowed per tour')
    }

    tourData.scenes?.forEach((scene, index) => {
      if (!scene.name?.trim()) {
        errors.push(`Scene ${index + 1} needs a name`)
      }
      if (!scene.image_url?.trim()) {
        errors.push(`Scene ${index + 1} needs an image`)
      }
    })

    return errors
  }

  /**
   * Generate tour preview data for testing
   */
  static generatePreviewTour(propertyTitle: string, imageUrls: string[]): VirtualTourData {
    const scenes: VirtualTourScene[] = imageUrls.map((url, index) => ({
      id: `preview_scene_${index}`,
      name: `Room ${index + 1}`,
      image_url: url,
      description: `Preview of room ${index + 1}`,
      hotspots: []
    }))

    // Create basic navigation hotspots
    scenes.forEach((scene, index) => {
      const nextIndex = (index + 1) % scenes.length
      const prevIndex = (index - 1 + scenes.length) % scenes.length
      
      if (scenes.length > 1) {
        scene.hotspots = [
          {
            id: `${scene.id}_next`,
            target_scene_id: scenes[nextIndex].id,
            position: { yaw: Math.PI / 2, pitch: 0 },
            title: `Next Room`,
            description: `Go to ${scenes[nextIndex].name}`,
            type: 'navigation'
          }
        ]

        if (scenes.length > 2) {
          scene.hotspots.push({
            id: `${scene.id}_prev`,
            target_scene_id: scenes[prevIndex].id,
            position: { yaw: -Math.PI / 2, pitch: 0 },
            title: `Previous Room`,
            description: `Go to ${scenes[prevIndex].name}`,
            type: 'navigation'
          })
        }
      }
    })

    return {
      id: `preview_tour_${Date.now()}`,
      property_id: 'preview',
      title: `${propertyTitle} - Virtual Tour`,
      scenes,
      default_scene_id: scenes[0]?.id,
      settings: {
        auto_rotate: false,
        zoom_enabled: true,
        navigation_enabled: true,
        controls_visible: true,
        transition_duration: 800
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

// Export utility functions
export const {
  uploadTourImages,
  validateImage,
  createTourData,
  optimizeImage,
  calculateTourStats,
  validateTourData,
  generatePreviewTour
} = VirtualTourService
