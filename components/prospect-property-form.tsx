"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { api, type Category } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProspectPropertyFormProps {
  categories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProspectPropertyForm({ categories, onSuccess, onCancel }: ProspectPropertyFormProps) {
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
    estimated_worth: "",
    year_of_construction: "",
    image_url: "",
  })

  const handleImageChange = (urls: string[]) => {
    // For prospect properties, we only use the first image
    setFormData({ ...formData, image_url: urls[0] || "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a property title")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a property description")
      return
    }
    if (!formData.location.trim()) {
      toast.error("Please enter a property location")
      return
    }
    if (!formData.category_id) {
      toast.error("Please select a category")
      return
    }

    setCreating(true)
    try {
      const propertyData = {
        ...formData,
        category_id: Number.parseInt(formData.category_id),
        estimated_worth: formData.estimated_worth ? Number.parseFloat(formData.estimated_worth) : undefined,
        year_of_construction: formData.year_of_construction
          ? Number.parseInt(formData.year_of_construction)
          : undefined,
      }

      const response = await api.createProspectProperty(propertyData)
      if (response.success) {
        toast.success("Prospect property created successfully!")
        setFormData({
          title: "",
          description: "",
          location: "",
          category_id: "",
          estimated_worth: "",
          year_of_construction: "",
          image_url: "",
        })
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Error creating prospect property:", error)
      toast.error(error.message || "Failed to create prospect property")
    } finally {
      setCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter property title"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the property in detail"
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter property location"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="estimated_worth">Estimated Worth (₦)</Label>
          <Input
            id="estimated_worth"
            type="number"
            value={formData.estimated_worth}
            onChange={(e) => setFormData({ ...formData, estimated_worth: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="year_of_construction">Year Built</Label>
          <Input
            id="year_of_construction"
            type="number"
            value={formData.year_of_construction}
            onChange={(e) => setFormData({ ...formData, year_of_construction: e.target.value })}
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="grid gap-2">
        <ImageUpload
          value={formData.image_url ? [formData.image_url] : []}
          onChange={handleImageChange}
          multiple={false}
          maxFiles={1}
          label="Property Image"
          description="Upload a single image for this prospect property."
          disabled={creating}
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={creating}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Prospect Property"
          )}
        </Button>
      </div>
    </form>
  )
}
