"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Activity, UserPlus, Search, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: "1",
    type: "user_created",
    user: { name: "John Doe", email: "john.doe@example.com", avatar: "/placeholder.svg" },
    timestamp: "2025-07-15T10:30:00Z",
  },
  {
    id: "2",
    type: "credit_check",
    user: { name: "HDFC Bank", email: "support@hdfc.com", avatar: "/placeholder.svg" },
    targetUser: "Rahul Kumar",
    timestamp: "2025-07-15T09:45:00Z",
  }
];

export function RecentActivity() {
  const t = useTranslations("admin.RecentActivity");
  const [visibleActivities, setVisibleActivities] = useState(5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? t("justNow") : t("hoursAgo", { hours: diffInHours });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {activities.slice(0, visibleActivities).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">{activity.type === "user_created" ? <UserPlus className="h-5 w-5 text-green-500" /> : <Search className="h-5 w-5 text-blue-500" />}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{activity.user.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(activity.type, { targetUser: activity.targetUser ?? "" })}
              </p>
            </div>
          </div>
        ))}
      </div>
      {visibleActivities < activities.length && (
        <Button variant="outline" className="w-full" onClick={() => setVisibleActivities((prev) => prev + 5)}>
          {t("loadMore")}
        </Button>
      )}
    </div>
  );
}
