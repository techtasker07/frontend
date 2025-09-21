"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onFileSelect?: (file: File | null) => void
  disabled?: boolean
  multiple?: boolean
  label?: string
  description?: string
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  disabled = false,
  multiple = false,
  label = "Image",
  description = "Upload an image file or provide a direct image URL",
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onFileSelect?.(file)

    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    if (url) {
      setPreviewUrl(url)
      setSelectedFile(null)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    onChange("")
    onFileSelect?.(null)
  }

  const displayUrl = previewUrl || value

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Preview */}
      {displayUrl && (
        <div className="relative w-full h-48 border border-dashed border-gray-300 rounded-lg overflow-hidden">
          <Image
            src={displayUrl || "/placeholder.svg"}
            alt="Preview"
            fill
            className="object-cover"
            onError={() => setPreviewUrl(null)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearSelection}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm text-muted-foreground">
            Upload File
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileChange}
              disabled={disabled}
              className="flex-1"
            />
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
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
            Image URL
          </Label>
          <Input
            id="url-input"
            type="url"
            value={value || ""}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}