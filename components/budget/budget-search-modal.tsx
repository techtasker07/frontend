"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Property } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Vote, 
  User, 
  ArrowRight, 
  X,
  Search
} from "lucide-react"

interface BudgetSearchModalProps {
  isOpen: boolean
  onClose: () => void
  properties: Property[]
  budget: number
  loading?: boolean
}

export function BudgetSearchModal({ 
  isOpen, 
  onClose, 
  properties, 
  budget,
  loading = false 
}: BudgetSearchModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center text-xl font-bold">
            <Search className="mr-3 h-6 w-6 text-blue-600" />
            Properties within {formatCurrency(budget)} Budget
          </DialogTitle>
          <DialogDescription>
            Found {properties.length} properties that match your budget criteria
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-muted-foreground">Searching properties...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                No properties found within your budget of {formatCurrency(budget)}
              </p>
              <p className="text-sm text-muted-foreground">
                Try increasing your budget or check back later for new listings
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={`/properties/${property.id}`}>
                      <div className="relative overflow-hidden bg-muted flex items-center justify-center h-48 rounded-t-lg">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={
                              property.images.find((img) => img.is_primary)?.image_url ||
                              property.images[0].image_url ||
                              "/placeholder.svg"
                            }
                            alt={property.title}
                            fill
                            className="object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        ) : (
                          <Building className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 text-base">
                            {property.title}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {property.category_name}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.location}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {property.description}
                        </p>

                        <div className="flex justify-between items-center text-sm mb-2">
                          {property.current_worth && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(property.current_worth)}
                              </span>
                            </div>
                          )}
                          {property.year_of_construction && (
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{property.year_of_construction}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Vote className="h-3 w-3 mr-1" />
                              <span>{property.vote_count || 0} votes</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{property.owner_name || "Anonymous"}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              className="cursor-pointer"
              type="button"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
