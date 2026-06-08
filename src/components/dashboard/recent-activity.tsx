import Link from "next/link"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ActivityItem = {
  id: string
  type: "PO" | "SO"
  docNumber: string
  partyName: string
  totalAmount: number
  status: string
  date: Date
  href: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Nomor</TableHead>
                <TableHead>Pihak</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Belum ada aktivitas
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={`${activity.type}-${activity.id}`}>
                    <TableCell>
                      <span
                        className={
                          activity.type === "PO"
                            ? "text-blue-700 font-medium text-xs uppercase"
                            : "text-emerald-700 font-medium text-xs uppercase"
                        }
                      >
                        {activity.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={activity.href} className="doc-number hover:underline">
                        {activity.docNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">{activity.partyName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(activity.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={activity.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(activity.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
