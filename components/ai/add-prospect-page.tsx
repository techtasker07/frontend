"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X, ArrowLeft, Home } from "lucide-react"
import { toast } from "sonner"

interface ProspectFormData {
  title: string
  description: string
  location: string
  estimatedWorth: string
  yearOfConstruction: string
}

interface AddProspectPageProps {
  onClose: () => void
  onBack: () => void
  onSubmit: (data: ProspectFormData) => Promise<void>
  initialData: {
    title: string
    location: string
    estimatedWorth: number
    yearBuilt?: number
  }
}

export function AddProspectPage({ onClose, onBack, onSubmit, initialData }: AddProspectPageProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - hidden on mobile */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200 hidden md:block">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
              <Save className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Add Prospect Property
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
              title="Close and go to Dashboard"
            >
              <X className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Fixed close button for mobile */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="fixed top-4 right-4 z-30 h-9 w-9 p-0 hover:bg-red-100 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 md:hidden"
          title="Close and go to Dashboard"
        >
          <X className="h-5 w-5 text-red-600" />
        </Button>

        {/* Content */}
        <div className="flex-1 p-4 pb-6">
          <div className="max-w-2xl mx-auto">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form id="prospect-form" onSubmit={handleSubmit} className="space-y-6">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">
                      The captured image will be automatically processed to generate prospects across multiple categories.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>

        {/* Fixed bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <Button 
              onClick={onBack}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 py-3"
              disabled={loading}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              type="submit"
              form="prospect-form"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
            >
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
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
