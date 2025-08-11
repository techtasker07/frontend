"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface Prospect {
  id?: number
  title: string
  description: string
  estimated_cost: number
  total_cost: number
}

interface ProspectButtonsProps {
  propertyId: number
  prospects: Prospect[]
  className?: string
}

export default function ProspectButtons({ propertyId, prospects, className = "" }: ProspectButtonsProps) {
  const router = useRouter()

  const handleProspectClick = (prospectTitle: string) => {
    const encodedTitle = encodeURIComponent(prospectTitle)
    router.push(`/prospects/${propertyId}/${encodedTitle}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount)
  }

  if (!prospects || prospects.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-muted-foreground">No prospects available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-600">Investment Prospects</span>
      </div>

      <div className="grid gap-2">
        {prospects.slice(0, 4).map((prospect, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleProspectClick(prospect.title)}
            className="justify-between h-auto p-3 text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{prospect.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Investment: {formatCurrency(prospect.total_cost)}
              </div>
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              View
            </Badge>
          </Button>
        ))}
      </div>

      {prospects.length > 4 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          +{prospects.length - 4} more prospects available
        </p>
      )}
    </div>
  )
}
