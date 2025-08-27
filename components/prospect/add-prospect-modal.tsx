"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface ProspectFormData {
  title: string
  description: string
  location: string
  estimatedWorth: string
  yearOfConstruction: string
}

interface AddProspectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProspectFormData) => Promise<void>
  initialData: {
    title: string
    location: string
    estimatedWorth: number
    yearBuilt?: number
  }
}

export function AddProspectModal({ isOpen, onClose, onSubmit, initialData }: AddProspectModalProps) {
  const [formData, setFormData] = useState<ProspectFormData>({
    title: initialData.title,
    description: "",
    location: initialData.location,
    estimatedWorth: initialData.estimatedWorth.toString(),
    yearOfConstruction: initialData.yearBuilt?.toString() || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Property title is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Property description is required")
      return false
    }
    if (!formData.location.trim()) {
      setError("Property location is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await onSubmit(formData)
      toast.success("Prospect property added successfully!")
      onClose()
    } catch (error: any) {
      setError(error.message || "Failed to add prospect property. Please try again.")
      toast.error(error.message || "Failed to add prospect property. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string) => {
    const num = Number.parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(num)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              Add Prospect Property
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Modern apartment in city center"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the property..."
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Victoria Island, Lagos"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedWorth">Estimated Worth (₦)</Label>
              <Input
                id="estimatedWorth"
                name="estimatedWorth"
                type="number"
                value={formData.estimatedWorth}
                onChange={handleChange}
                placeholder="e.g., 15000000"
                min="0"
                step="1000"
                disabled={loading}
              />
              {formData.estimatedWorth && (
                <p className="text-sm text-muted-foreground">{formatCurrency(formData.estimatedWorth)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfConstruction">Year Built</Label>
              <Input
                id="yearOfConstruction"
                name="yearOfConstruction"
                type="number"
                value={formData.yearOfConstruction}
                onChange={handleChange}
                placeholder="e.g., 2023"
                min="1800"
                max={new Date().getFullYear() + 5}
                disabled={loading}
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              The captured image will be automatically processed to generate prospects across multiple categories.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Property...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Prospect Property
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
