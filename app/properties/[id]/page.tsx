"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { api, type Property, type PropertyStats } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import {
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Vote,
  BarChart3,
  ArrowLeft,
  Loader2,
  CheckCircle,
  PhoneIcon as Whatsapp,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(null)
  const [isPropertyOwner, setIsPropertyOwner] = useState(false)

  const propertyId = params.id as string

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
      fetchStats()
      if (isAuthenticated) {
        checkIfUserVoted()
      }
    }
  }, [propertyId, isAuthenticated])

  useEffect(() => {
    if (property && user) {
      setIsPropertyOwner(property.user_id === user.id)
    }
  }, [property, user])

  const fetchProperty = async () => {
    try {
      const response = await api.getProperty(propertyId)
      if (response.success) {
        setProperty(response.data)
      } else {
        toast.error("Property not found")
        router.push("/")
      }
    } catch (error) {
      toast.error("Failed to fetch property details")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.getPropertyStats(propertyId)
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch property stats:", error)
    }
  }

  const checkIfUserVoted = async () => {
    try {
      const response = await api.getVotesByProperty(propertyId)
      if (response.success) {
        const userVote = response.data.find((vote: any) => vote.user_id === user?.id)
        setHasVoted(!!userVote)
      }
    } catch (error) {
      console.error("Failed to check vote status:", error)
    }
  }

  const handleVote = async () => {
    if (!selectedVoteOption || !isAuthenticated || !property) return

    // Prevent property owner from voting
    if (isPropertyOwner) {
      toast.error("You cannot vote on your own property")
      return
    }

    setVoting(true)
    try {
      const response = await api.createVote({
        property_id: propertyId,
        vote_option_id: selectedVoteOption,
      })

      if (response.success) {
        setHasVoted(true)
        toast.success("Your vote has been recorded successfully!")
        // Refresh stats
        fetchStats()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to record vote")
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const primaryImage =
    property.images?.find((img: any) => img.is_primary)?.image_url ||
    property.images?.[0]?.image_url ||
    "/placeholder.svg"

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/properties">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {primaryImage !== "/placeholder.svg" ? (
              <Image
                src={primaryImage || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            ) : (
              <p className="text-muted-foreground">No images available</p>
            )}
          </div>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{property.title}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {property.category_name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{property.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.current_worth && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>
                        ₦
                        {Number(property.current_worth).toLocaleString("en-NG", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </strong>
                    </span>
                  </div>
                )}
                {property.year_of_construction && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {property.year_of_construction}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Vote className="h-3 w-3 mr-1" />
                  <span>{property.vote_count || 0} votes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Property Lister
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={property.owner_profile_picture || "/placeholder.svg"} alt={property.owner_name} />
                  <AvatarFallback className="text-lg">
                    {property.owner_name
                      ? `${property.owner_name.split(" ")[0][0]}${property.owner_name.split(" ")[1]?.[0] || ""}`.toUpperCase()
                      : "LS"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-lg">{property.owner_name}</p>
              </div>
              <div className="space-y-2">
                {property.owner_email && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{property.owner_email}</span>
                  </div>
                )}
                {property.lister_phone_number && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Whatsapp className="h-4 w-4" />
                    <span>{property.lister_phone_number}</span>
                  </div>
                )}
                {property.owner_phone && !property.lister_phone_number && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{property.owner_phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting Section */}
          <Card id="vote">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Vote className="mr-2 h-5 w-5" />
                Cast Your Vote
              </CardTitle>
              <CardDescription>
                {isPropertyOwner
                  ? "You cannot vote on your own property"
                  : hasVoted
                    ? "You have already voted on this property"
                    : "Select an option to vote on this property"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Alert>
                  <AlertDescription>
                    You must be logged in to vote.{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Sign in here
                    </Link>
                  </AlertDescription>
                </Alert>
              ) : isPropertyOwner ? (
                <div className="flex items-center space-x-2 text-blue-600">
                  <User className="h-5 w-5" />
                  <span>As the property lister, you cannot vote on your own property.</span>
                </div>
              ) : hasVoted ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Thank you for voting!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {property.vote_options && property.vote_options.length > 0 ? (
                    <>
                      {property.vote_options.map((option: any) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`option-${option.id}`}
                            name="vote-option"
                            value={option.id}
                            onChange={() => setSelectedVoteOption(option.id)}
                            className="w-4 h-4 text-primary"
                          />
                          <label htmlFor={`option-${option.id}`} className="text-sm font-medium">
                            {option.name}
                          </label>
                        </div>
                      ))}

                      <Button onClick={handleVote} disabled={!selectedVoteOption || voting} className="w-full">
                        {voting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Vote...
                          </>
                        ) : (
                          "Submit Vote"
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Vote className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">No voting options available for this property category.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Voting Results - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Current Voting Results
              </CardTitle>
              <CardDescription>
                {stats?.total_votes ? `Total votes: ${stats.total_votes}` : "No votes yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.statistics.length > 0 ? (
                <div className="space-y-4">
                  {stats.statistics.map((stat: any) => (
                    <div key={stat.vote_option_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="font-medium text-sm">{stat.option_name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{stat.vote_count} votes</div>
                          <div className="text-xs text-muted-foreground">{stat.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Vote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No votes cast yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to vote on this property!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Voting Statistics - Only show if there are votes */}
          {stats && stats.statistics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.statistics.map((stat: any, index: number) => (
                    <div
                      key={stat.vote_option_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            index === 0
                              ? "bg-green-500"
                              : index === 1
                                ? "bg-blue-500"
                                : index === 2
                                  ? "bg-yellow-500"
                                  : index === 3
                                    ? "bg-red-500"
                                    : "bg-purple-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{stat.option_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {stat.vote_count} {stat.vote_count === 1 ? "person" : "people"} voted
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{stat.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Total community votes: <span className="font-semibold">{stats.total_votes}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
