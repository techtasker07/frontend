'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { api, Property, VoteOption, PropertyStats } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { MapPin, Calendar, DollarSign, User, Phone, Mail, Vote, BarChart3, ArrowLeft, Loader2, CheckCircle, PhoneIcon as Whatsapp } from 'lucide-react' // Added Whatsapp icon
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [stats, setStats] = useState<PropertyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedVoteOption, setSelectedVoteOption] = useState<number | null>(null)

  const propertyId = parseInt(params.id as string)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
      fetchStats()
      if (isAuthenticated) {
        checkIfUserVoted()
      }
    }
  }, [propertyId, isAuthenticated])

  const fetchProperty = async () => {
    try {
      const response = await api.getProperty(propertyId)
      if (response.success) {
        setProperty(response.data)
      } else {
        toast.error('Property not found')
        router.push('/')
      }
    } catch (error) {
      toast.error('Failed to fetch property details')
      router.push('/')
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
      console.error('Failed to fetch property stats:', error)
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
      console.error('Failed to check vote status:', error)
    }
  }

  const handleVote = async () => {
    if (!selectedVoteOption || !isAuthenticated) return

    setVoting(true)
    try {
      const response = await api.createVote({
        property_id: propertyId,
        vote_option_id: selectedVoteOption,
      })

      if (response.success) {
        setHasVoted(true)
        toast.success('Your vote has been recorded successfully!')
        // Refresh stats
        fetchStats()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record vote')
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

  const primaryImage = property.images?.find((img: any) => img.is_primary)?.image_url || property.images?.[0]?.image_url || "/placeholder.svg";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
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
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")} // Fallback if image fails to load
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
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>₦{property.current_worth.toLocaleString()}</strong>
                    </span>
                  </div>
                )}
                {property.year_of_construction && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {property.year_of_construction}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Vote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{stats?.total_votes || 0} votes</span>
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
                    {property.owner_name ? `${property.owner_name.split(' ')[0][0]}${property.owner_name.split(' ')[1]?.[0] || ''}`.toUpperCase() : 'LS'}
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
                {property.lister_phone_number && ( // Display lister's specific phone number
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Whatsapp className="h-4 w-4" /> {/* Changed to Whatsapp icon */}
                    <span>{property.lister_phone_number}</span>
                  </div>
                )}
                 {property.owner_phone && !property.lister_phone_number && ( // Fallback to owner_phone if lister_phone_number not provided
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
                {hasVoted 
                  ? "You have already voted on this property" 
                  : "Select an option to vote on this property"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <Alert>
                  <AlertDescription>
                    You must be logged in to vote.{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Sign in here
                    </Link>
                  </AlertDescription>
                </Alert>
              ) : hasVoted ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Thank you for voting!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {property.vote_options?.map((option: any) => (
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
                  
                  <Button 
                    onClick={handleVote} 
                    disabled={!selectedVoteOption || voting}
                    className="w-full"
                  >
                    {voting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Vote...
                      </>
                    ) : (
                      'Submit Vote'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voting Statistics */}
          {stats && stats.statistics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Voting Results
                </CardTitle>
                <CardDescription>
                  Total votes: {stats.total_votes}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.statistics.map((stat: any) => (
                  <div key={stat.vote_option_id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stat.option_name}</span>
                      <span className="text-muted-foreground">
                        {stat.vote_count} votes ({stat.percentage}%)
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
