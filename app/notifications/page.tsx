"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Settings,
  Building,
  Vote,
  Users,
  Lightbulb,
  AlertCircle,
  Eye,
  Clock,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: "property" | "vote" | "system" | "prospect" | "social" | "security"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  actionUrl?: string
  metadata?: {
    propertyId?: string
    userId?: string
    propertyTitle?: string
    userName?: string
    voteCount?: number
    prospectCount?: number
  }
}

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock notifications data - in real app, this would come from API
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "property",
      title: "New Property Added",
      message: "A new property 'Modern 3-bedroom house in Victoria Island' has been added to your watchlist area.",
      timestamp: "2024-12-15T10:30:00Z",
      read: false,
      priority: "medium",
      actionUrl: "/properties/123",
      metadata: {
        propertyId: "123",
        propertyTitle: "Modern 3-bedroom house in Victoria Island",
      },
    },
    {
      id: "2",
      type: "vote",
      title: "Your Property Received New Votes",
      message: "Your property 'Luxury Apartment in Lekki' received 5 new votes. Current rating: 4.2/5",
      timestamp: "2024-12-15T09:15:00Z",
      read: false,
      priority: "high",
      actionUrl: "/properties/456",
      metadata: {
        propertyId: "456",
        propertyTitle: "Luxury Apartment in Lekki",
        voteCount: 5,
      },
    },
    {
      id: "3",
      type: "prospect",
      title: "New AI Prospects Available",
      message: "4 new AI-generated investment prospects are available for your property in Ikeja.",
      timestamp: "2024-12-15T08:45:00Z",
      read: true,
      priority: "medium",
      actionUrl: "/prospectProperties/789",
      metadata: {
        propertyId: "789",
        prospectCount: 4,
      },
    },
    {
      id: "4",
      type: "social",
      title: "New Follower",
      message: "John Doe started following your property listings.",
      timestamp: "2024-12-14T16:20:00Z",
      read: true,
      priority: "low",
      metadata: {
        userId: "user123",
        userName: "John Doe",
      },
    },
    {
      id: "5",
      type: "system",
      title: "Platform Update",
      message: "New features added: Enhanced AI prospects and improved property search filters.",
      timestamp: "2024-12-14T12:00:00Z",
      read: false,
      priority: "medium",
      actionUrl: "/help",
    },
    {
      id: "6",
      type: "security",
      title: "Login from New Device",
      message:
        "We detected a login from a new device in Lagos, Nigeria. If this wasn't you, please secure your account.",
      timestamp: "2024-12-14T10:30:00Z",
      read: false,
      priority: "high",
      actionUrl: "/profile",
    },
    {
      id: "7",
      type: "property",
      title: "Property Evaluation Complete",
      message: "Community evaluation for your property 'Commercial Space in Surulere' is now complete with 25 votes.",
      timestamp: "2024-12-13T14:15:00Z",
      read: true,
      priority: "medium",
      actionUrl: "/properties/321",
      metadata: {
        propertyId: "321",
        propertyTitle: "Commercial Space in Surulere",
        voteCount: 25,
      },
    },
    {
      id: "8",
      type: "prospect",
      title: "High ROI Prospect Identified",
      message: "AI analysis suggests a high ROI opportunity for solar panel installation on your property.",
      timestamp: "2024-12-13T11:00:00Z",
      read: true,
      priority: "high",
      actionUrl: "/prospectProperties/654",
    },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 1000)
  }, [isAuthenticated, router])

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-blue-500"

    switch (type) {
      case "property":
        return <Building className={`h-5 w-5 ${iconClass}`} />
      case "vote":
        return <Vote className={`h-5 w-5 ${iconClass}`} />
      case "prospect":
        return <Lightbulb className={`h-5 w-5 ${iconClass}`} />
      case "social":
        return <Users className={`h-5 w-5 ${iconClass}`} />
      case "system":
        return <Settings className={`h-5 w-5 ${iconClass}`} />
      case "security":
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="text-xs bg-yellow-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
    toast.success("Notification marked as read")
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast.success("All notifications marked as read")
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
    toast.success("Notification deleted")
  }

  const handleBulkAction = (action: "read" | "delete") => {
    if (selectedNotifications.length === 0) {
      toast.error("Please select notifications first")
      return
    }

    if (action === "read") {
      setNotifications((prev) =>
        prev.map((notification) =>
          selectedNotifications.includes(notification.id) ? { ...notification, read: true } : notification,
        ),
      )
      toast.success(`${selectedNotifications.length} notifications marked as read`)
    } else if (action === "delete") {
      setNotifications((prev) => prev.filter((notification) => !selectedNotifications.includes(notification.id)))
      toast.success(`${selectedNotifications.length} notifications deleted`)
    }

    setSelectedNotifications([])
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.read) ||
      (filterStatus === "read" && notification.read)
    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
              <Bell className="mr-3 h-8 w-8 text-blue-600" />
              Notifications
              {unreadCount > 0 && <Badge className="ml-3 bg-red-500 text-white">{unreadCount} new</Badge>}
            </h1>
            <p className="text-slate-600">Stay updated with your property activities and platform updates</p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="vote">Voting</SelectItem>
                    <SelectItem value="prospect">AI Prospects</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-slate-600">{selectedNotifications.length} selected</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("read")}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("delete")}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No notifications found</h3>
                <p className="text-slate-500">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  notification.read
                    ? "bg-white/70 backdrop-blur-sm"
                    : "bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotifications((prev) => [...prev, notification.id])
                          } else {
                            setSelectedNotifications((prev) => prev.filter((id) => id !== notification.id))
                          }
                        }}
                      />
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${notification.read ? "text-slate-700" : "text-slate-900"}`}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${notification.read ? "text-slate-500" : "text-slate-700"}`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center text-xs text-slate-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(notification.timestamp)}
                            </div>
                            {notification.actionUrl && (
                              <Button asChild size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                                <Link href={notification.actionUrl}>View Details</Link>
                              </Button>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            {notification.actionUrl && (
                              <DropdownMenuItem asChild>
                                <Link href={notification.actionUrl}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
