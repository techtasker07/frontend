"use client"

import { useState, useMemo, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: string
  actionUrl?: string
  actionText?: string
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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


const notificationTypes = {
  property: { icon: Building, label: "Property", color: "text-blue-600" },
  voting: { icon: Vote, label: "Voting", color: "text-green-600" },
  ai_prospect: { icon: Lightbulb, label: "AI Prospects", color: "text-purple-600" },
  social: { icon: Users, label: "Social", color: "text-pink-600" },
  system: { icon: Settings, label: "System", color: "text-gray-600" },
  security: { icon: Shield, label: "Security", color: "text-red-600" },
  rees_party: { icon: Users, label: "Re-es Party", color: "text-orange-600" },
}

const priorityColors = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-500 bg-yellow-50",
  low: "border-l-blue-500 bg-blue-50",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false })

        if (error) {
          console.error('Error fetching notifications:', error)
          return
        }

        // Convert timestamp strings to Date objects
        const formattedNotifications = data.map(notification => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }))

        setNotifications(formattedNotifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

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
  const totalCount = notifications.length

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

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)

      if (error) {
        console.error('Error marking notifications as read:', error)
        return
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id) ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)

      if (error) {
        console.error('Error deleting notifications:', error)
        return
      }

      setNotifications((prev) => prev.filter((notification) => !notificationIds.includes(notification.id)))
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
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
              <Bell className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-600">Notifications</h1>
                <p className="text-slate-400">
                  {!loading && totalCount > 0 ? `${totalCount} notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            {!loading && unreadCount > 0 && <Badge className="bg-red-500 text-white px-3 py-1">{unreadCount} new</Badge>}
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
        <div className="mb-6">
          <div className="lg:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="voting">Voting</SelectItem>
                <SelectItem value="ai_prospect">AI</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="rees_party">Re-es Party</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden lg:block">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="property">Property</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                <TabsTrigger value="ai_prospect">AI</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="rees_party">Re-es Party</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Bulk Actions */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="hidden sm:flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 p-3 bg-white rounded-lg shadow-sm">
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
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up! No new notifications."}
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
                        className="mt-1 hidden sm:block"
                      />

                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full bg-white shadow-sm`}>
                          <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3
                                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                              <Badge variant="outline" className="text-xs">
                                {notificationTypes[notification.type as keyof typeof notificationTypes].label}
                              </Badge>
                              {notification.priority === "high" && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
        {!loading && filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Notifications</Button>
          </div>
        )}
      </div>
    </div>
  )
}
