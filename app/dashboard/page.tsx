'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { api, Property, Vote } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Building, VoteIcon, TrendingUp, Eye, Edit, Trash2, Plus, BarChart3, Calendar, MapPin, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import {
AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function DashboardPage() {
const [userProperties, setUserProperties] = useState<Property[]>([])
const [userVotes, setUserVotes] = useState<Vote[]>([])
const [stats, setStats] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [deletingProperty, setDeletingProperty] = useState<string | null>(null)

const { user, isAuthenticated, loading: authLoading } = useAuth()
const router = useRouter()

useEffect(() => {
  // Only redirect if we're not loading and definitely not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Only fetch data if we're authenticated and not loading
  if (!authLoading && isAuthenticated) {
    fetchDashboardData()
  }
}, [isAuthenticated, authLoading])

const fetchDashboardData = async () => {
  try {
    setLoading(true)
    
    // Fetch user's properties
    const propertiesResponse = await api.getProperties({ user_id: user?.id })
    if (propertiesResponse.success) {
      setUserProperties(propertiesResponse.data)
    }

    // Fetch user's votes
    const votesResponse = await api.getVotes()
    if (votesResponse.success) {
      const userVotesData = votesResponse.data.filter(vote => vote.user_id === user?.id)
      setUserVotes(userVotesData)
    }

    // Fetch platform stats
    const statsResponse = await api.getPlatformStats()
    if (statsResponse.success) {
      setStats(statsResponse.data)
    }
  } catch (error) {
    toast.error('Failed to fetch dashboard data')
  } finally {
    setLoading(false)
  }
}

const handleDeleteProperty = async (propertyId: string) => {
  try {
    setDeletingProperty(propertyId)
    const response = await api.deleteProperty(propertyId)
    
    if (response.success) {
      setUserProperties(prev => prev.filter(p => p.id !== propertyId))
      toast.success('Property deleted successfully')
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete property')
  } finally {
    setDeletingProperty(null)
  }
}

if (!isAuthenticated) {
  return null // Will redirect to login
}

if (loading) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    </div>
  )
}

const totalVotesReceived = userProperties.reduce((sum, property) => sum + (property.vote_count || 0), 0)

return (
  <div className="container mx-auto px-4 py-8">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.first_name}! Here's your property portfolio overview.
        </p>
      </div>
      <Button asChild>
        <Link href="/add-property">
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Link>
      </Button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userProperties.length}</div>
          <p className="text-xs text-muted-foreground">
            Properties you've added
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
          <VoteIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userVotes.length}</div>
          <p className="text-xs text-muted-foreground">
            Votes you've made
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Votes Received</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotesReceived}</div>
          <p className="text-xs text-muted-foreground">
            On your properties
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Main Content Tabs */}
    <Tabs defaultValue="properties" className="space-y-6">
      <TabsList>
        <TabsTrigger value="properties">My Properties</TabsTrigger>
        <TabsTrigger value="votes">My Votes</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* My Properties Tab */}
      <TabsContent value="properties" className="space-y-6">
        {userProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
                    <Badge variant="secondary">{property.category_name}</Badge>
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {property.current_worth && (
                      <div className="flex items-center text-sm">
                        <span>
                          ₦{property.current_worth.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </span>
                      </div>
                    )}
                    {property.year_of_construction && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Built in {property.year_of_construction}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <VoteIcon className="h-3 w-3 mr-1" />
                      <span>{property.vote_count || 0} votes</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/properties/${property.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/properties/${property.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{property.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProperty(property.id)}
                            disabled={deletingProperty === property.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingProperty === property.id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your portfolio by adding your first property
              </p>
              <Button asChild>
                <Link href="/add-property">Add Your First Property</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* My Votes Tab */}
      <TabsContent value="votes" className="space-y-6">
        {userVotes.length > 0 ? (
          <div className="space-y-4">
            {userVotes.map((vote) => (
              <Card key={vote.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{vote.property_title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Voted: {vote.vote_option_name}</span>
                        <span>•</span>
                        <span>{new Date(vote.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/properties/${vote.property_id}`}>
                        View Property
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <VoteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No votes cast yet</h3>
              <p className="text-muted-foreground mb-4">
                Start participating by voting on properties in the community
              </p>
              <Button asChild>
                <Link href="/">Browse Properties</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
              <CardDescription>Vote distribution across your properties</CardDescription>
            </CardHeader>
            <CardContent>
              {userProperties.length > 0 ? (
                <div className="space-y-4">
                  {userProperties
                    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                    .slice(0, 5)
                    .map((property) => (
                      <div key={property.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium line-clamp-1">{property.title}</span>
                          <span className="text-muted-foreground">
                            {property.vote_count || 0} votes
                          </span>
                        </div>
                        <Progress 
                          value={totalVotesReceived > 0 ? ((property.vote_count || 0) / totalVotesReceived) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No properties to analyze yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Your properties by category</CardDescription>
            </CardHeader>
            <CardContent>
              {userProperties.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    userProperties.reduce((acc, property) => {
                      const category = property.category_name || 'Unknown'
                      acc[category] = (acc[category] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">
                          {count} {count === 1 ? 'property' : 'properties'}
                        </span>
                      </div>
                      <Progress 
                        value={(count / userProperties.length) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No properties to analyze yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Platform Comparison */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>How you compare to the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {((userProperties.length / stats.total_properties) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    of all properties are yours
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {((userVotes.length / stats.total_votes) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    of all votes are yours
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProperties.length > 0 ? (totalVotesReceived / userProperties.length).toFixed(1) : '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    average votes per property
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  </div>
)
}
