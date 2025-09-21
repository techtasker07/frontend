"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, RefreshCw, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { formatCompactCurrency } from "@/lib/currency"

interface Prospect {
  id?: string
  title: string
  description: string
  estimated_cost: number
  total_cost: number
}

interface ProspectButtonsProps {
  propertyId: string
  prospects: Prospect[]
  className?: string
  onProspectsUpdated?: (prospects: Prospect[]) => void
}

export default function ProspectButtons({
  propertyId,
  prospects,
  className = "",
  onProspectsUpdated,
}: ProspectButtonsProps) {
  const router = useRouter()
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleProspectClick = (prospectTitle: string) => {
    const encodedTitle = encodeURIComponent(prospectTitle)
    router.push(`/prospects/${propertyId}/${encodedTitle}`)
  }

  const handleRegenerateProspects = async () => {
    // TODO: Implement AI prospect generation with Supabase
    toast.info("AI prospect regeneration will be implemented in future updates")
  }



  if (!prospects || prospects.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="mb-4">
          <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-4">No AI prospects available</p>
        </div>
        <Button
          onClick={handleRegenerateProspects}
          disabled={isRegenerating}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate AI Prospects
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Investment Prospects</span>
        </div>
        <Button
          onClick={handleRegenerateProspects}
          disabled={isRegenerating}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          {isRegenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
        </Button>
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
                Investment: {formatCompactCurrency(prospect.total_cost)}
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
