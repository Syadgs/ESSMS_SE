"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp, TrendingDown, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Reminder } from "@/lib/dashboard-reminders"

interface ReminderPortletsProps {
  reminders: Reminder[]
}

const priorityConfig = {
  high: { bg: "bg-red-50 border-red-200 hover:bg-red-100", badge: "bg-red-100 text-red-700", icon: TrendingUp },
  medium: { bg: "bg-amber-50 border-amber-200 hover:bg-amber-100", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  low: { bg: "bg-blue-50 border-blue-200 hover:bg-blue-100", badge: "bg-blue-100 text-blue-700", icon: TrendingDown },
}

export function ReminderPortlets({ reminders }: ReminderPortletsProps) {
  if (reminders.length === 0) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 py-4">
          <Bell className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700">All tasks complete — no items need action.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Items Needing Action
        </h3>
        <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">
          {reminders.length}
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reminders.map((reminder) => {
          const config = priorityConfig[reminder.priority]
          const Icon = config.icon
          return (
            <Link
              key={reminder.id}
              href={reminder.href}
              className={`block rounded-lg border p-4 transition-colors ${config.bg}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">{reminder.title}</p>
                  {reminder.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{reminder.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-lg font-bold min-w-[2rem] ${config.badge}`}
                >
                  {reminder.count}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Icon className="h-3 w-3 opacity-60" />
                <span className="text-[10px] uppercase tracking-wide opacity-60 font-medium">
                  {reminder.priority === "high" ? "High Priority" : reminder.priority === "medium" ? "Medium" : "Low"}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
