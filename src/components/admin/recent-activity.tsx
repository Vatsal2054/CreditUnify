"use client"

import { useState } from "react"
import { Activity, UserPlus, Search, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data - would be replaced with actual data from your API
const activities = [
  {
    id: "1",
    type: "user_created",
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "2023-07-15T10:30:00Z",
    details: "New user account created",
  },
  {
    id: "2",
    type: "credit_check",
    user: {
      name: "HDFC Bank",
      email: "support@hdfc.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    targetUser: "Rahul Kumar",
    timestamp: "2023-07-15T09:45:00Z",
    details: "Credit score checked for Rahul Kumar",
  },
  {
    id: "3",
    type: "alert",
    user: {
      name: "System",
      email: "system@creditunify.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "2023-07-15T08:20:00Z",
    details: "Multiple credit score checks detected for user ID #4",
    severity: "warning",
  },
  {
    id: "4",
    type: "credit_update",
    user: {
      name: "System",
      email: "system@creditunify.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    targetUser: "Priya Sharma",
    timestamp: "2023-07-14T16:10:00Z",
    details: "Credit score updated from 710 to 745",
    change: "positive",
  },
  {
    id: "5",
    type: "alert",
    user: {
      name: "System",
      email: "system@creditunify.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "2023-07-14T14:05:00Z",
    details: "Failed login attempts detected for admin account",
    severity: "critical",
  },
  {
    id: "6",
    type: "user_login",
    user: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "2023-07-14T13:30:00Z",
    details: "Admin user logged in",
  },
]

export function RecentActivity() {
  const [visibleActivities, setVisibleActivities] = useState(5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return diffInHours === 0 ? "Just now" : `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getActivityIcon = (type: string, severity?: string, change?: string) => {
    switch (type) {
      case "user_created":
        return <UserPlus className="h-5 w-5 text-green-500" />
      case "credit_check":
        return <Search className="h-5 w-5 text-blue-500" />
      case "alert":
        return severity === "critical" ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        )
      case "credit_update":
        return change === "positive" ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-red-500" />
        )
      case "user_login":
        return <Activity className="h-5 w-5 text-blue-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {activities.slice(0, visibleActivities).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">{getActivityIcon(activity.type, activity.severity, activity.change)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{activity.user.name}</span>
                  {activity.type === "alert" && (
                    <Badge variant={activity.severity === "critical" ? "destructive" : "warning"}>
                      {activity.severity}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.details}</p>
            </div>
          </div>
        ))}
      </div>

      {visibleActivities < activities.length && (
        <Button variant="outline" className="w-full" onClick={() => setVisibleActivities((prev) => prev + 5)}>
          Load More
        </Button>
      )}
    </div>
  )
}

