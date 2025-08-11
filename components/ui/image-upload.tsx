"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  multiple?: boolean
  label?: string
  description?: string
  maxFiles?: number
}

export function ImageUpload({
  value = [],
  onChange,
  disabled = false,
  multiple = false,
  label = "Images",
  description = "Upload image files or provide direct image URLs",
  maxFiles = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file limits
    const totalFiles = value.length + files.length
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`)
        }

        const response = await api.uploadFile(file)
        return response.data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newUrls = multiple ? [...value, ...uploadedUrls] : uploadedUrls
      onChange(newUrls)
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload images")
    } finally {
      setUploading(false)
      // Clear the input
      e.target.value = ""
    }
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    if (value.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    const newUrls = multiple ? [...value, urlInput.trim()] : [urlInput.trim()]
    onChange(newUrls)
    setUrlInput("")
    toast.success("Image URL added")
  }

  const removeImage = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove)
    onChange(newUrls)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value]
    const [movedItem] = newUrls.splice(fromIndex, 1)
    newUrls.splice(toIndex, 0, movedItem)
    onChange(newUrls)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Image Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 border border-dashed border-gray-300 rounded-lg overflow-hidden">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveImage(index, index - 1)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        ←
                      </Button>
                    )}
                    {index < value.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveImage(index, index + 1)}
                        disabled={disabled}
                        className="h-8 w-8 p-0"
                      >
                        →
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      {value.length < maxFiles && (
        <div className="space-y-3">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-sm text-muted-foreground">
              Upload Files
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="flex-1"
              />
              <Button type="button" variant="outline" disabled={disabled || uploading} className="px-3 bg-transparent">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url-input" className="text-sm text-muted-foreground">
              Add Image URL
            </Label>
            <div className="flex space-x-2">
              <Input
                id="url-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={disabled}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleUrlAdd} disabled={disabled || !urlInput.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{description}</span>
        <span>
          {value.length}/{maxFiles} images
        </span>
      </div>
    </div>
  )
}
