"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  MoreVertical,
  Check,
  Trash2,
  Eye,
  Building,
  Vote,
  Lightbulb,
  Users,
  Settings,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "property",
    title: "New Property Evaluation",
    message: "Your property at 123 Lagos Street has received a new evaluation of ₦45,000,000",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: "high",
    actionUrl: "/properties/123",
    actionText: "View Property",
  },
  {
    id: "2",
    type: "voting",
    title: "New Vote on Your Property",
    message: "Someone voted on your property evaluation. Current average: ₦42,500,000",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    priority: "medium",
    actionUrl: "/properties/123",
    actionText: "View Votes",
  },
  {
    id: "3",
    type: "ai_prospect",
    title: "New AI Investment Opportunity",
    message: "We found a promising investment opportunity in Victoria Island matching your preferences",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    priority: "high",
    actionUrl: "/prospectProperties",
    actionText: "View Prospects",
  },
  {
    id: "4",
    type: "social",
    title: "New Follower",
    message: "John Doe started following your property evaluations",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: "low",
    actionUrl: "/profile",
    actionText: "View Profile",
  },
  {
    id: "5",
    type: "system",
    title: "Platform Update",
    message: "New features added: Enhanced AI property matching and improved mobile experience",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
    priority: "medium",
    actionUrl: "/help",
    actionText: "Learn More",
  },
  {
    id: "6",
    type: "security",
    title: "Security Alert",
    message: "New login detected from Lagos, Nigeria on Chrome browser",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    priority: "high",
    actionUrl: "/settings",
    actionText: "Review Security",
  },
]

const notificationTypes = {
  property: { icon: Building, label: "Property", color: "text-blue-600" },
  voting: { icon: Vote, label: "Voting", color: "text-green-600" },
  ai_prospect: { icon: Lightbulb, label: "AI Prospects", color: "text-purple-600" },
  social: { icon: Users, label: "Social", color: "text-pink-600" },
  system: { icon: Settings, label: "System", color: "text-gray-600" },
  security: { icon: Shield, label: "Security", color: "text-red-600" },
}

const priorityColors = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-500 bg-yellow-50",
  low: "border-l-blue-500 bg-blue-50",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter notifications based on search and tab
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      if (activeTab === "unread") {
        filtered = filtered.filter((notification) => !notification.read)
      } else {
        filtered = filtered.filter((notification) => notification.type === activeTab)
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, searchQuery, activeTab])

  const unreadCount = notifications.filter((n) => !n.read).length

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const markAsRead = (notificationIds: string[]) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notificationIds.includes(notification.id) ? { ...notification, read: true } : notification,
      ),
    )
  }

  const deleteNotifications = (notificationIds: string[]) => {
    setNotifications((prev) => prev.filter((notification) => !notificationIds.includes(notification.id)))
    setSelectedNotifications([])
  }

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map((n) => n.id)
    setSelectedNotifications(visibleIds)
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
                <p className="text-slate-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white px-3 py-1">{unreadCount} new</Badge>}
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">{selectedNotifications.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => markAsRead(selectedNotifications)}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteNotifications(selectedNotifications)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
            <TabsTrigger value="ai_prospect">AI</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectAllVisible()
                  } else {
                    clearSelection()
                  }
                }}
              />
              <span className="text-sm text-slate-600">Select all visible ({filteredNotifications.length})</span>
            </div>
            {selectedNotifications.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAsRead(filteredNotifications.filter((n) => !n.read).map((n) => n.id))}
              >
                Mark all as read
              </Button>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up!"}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const TypeIcon = notificationTypes[notification.type as keyof typeof notificationTypes].icon
              const typeColor = notificationTypes[notification.type as keyof typeof notificationTypes].color
              const isSelected = selectedNotifications.includes(notification.id)

              return (
                <Card
                  key={notification.id}
                  className={`
                    border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer
                    ${priorityColors[notification.priority as keyof typeof priorityColors]}
                    ${!notification.read ? "bg-blue-50/50" : "bg-white"}
                    ${isSelected ? "ring-2 ring-blue-500" : ""}
                  `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1"
                      />

                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full bg-white shadow-sm`}>
                          <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              <Badge variant="outline" className="text-xs">
                                {notificationTypes[notification.type as keyof typeof notificationTypes].label}
                              </Badge>
                              {notification.priority === "high" && <AlertCircle className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.read && (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span>Read</span>
                                </div>
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
                                <DropdownMenuItem onClick={() => markAsRead([notification.id])}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteNotifications([notification.id])}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {notification.actionUrl && (
                          <div className="mt-3">
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              {notification.actionText}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Notifications</Button>
          </div>
        )}
      </div>
    </div>
  )
}
