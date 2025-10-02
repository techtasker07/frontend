"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Vote, ShoppingBag } from "lucide-react"

interface PropertyTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyTypeDialog({ open, onOpenChange }: PropertyTypeDialogProps) {
  const router = useRouter()

  const handlePollPropertyClick = () => {
    onOpenChange(false)
    router.push("/add-property")
  }

  const handleMarketplacePropertyClick = () => {
    onOpenChange(false)
    router.push("/marketplace/create")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Choose the type of property you want to add to the platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
            onClick={handlePollPropertyClick}
          >
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Vote className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Poll Property</h3>
                <p className="text-sm text-muted-foreground">
                  Submit a property for community evaluation and voting. Get feedback on property value and investment potential.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-300"
            onClick={handleMarketplacePropertyClick}
          >
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Marketplace Property</h3>
                <p className="text-sm text-muted-foreground">
                  List a property for sale, rent, lease, or booking. Create a commercial listing for potential buyers or tenants.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
