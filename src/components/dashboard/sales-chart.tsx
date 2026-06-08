"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export type SalesChartData = {
  month: string
  total: number
  count: number
}

interface SalesChartProps {
  data: SalesChartData[]
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif">Penjualan 6 Bulan Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "total") return [formatCurrency(value), "Total Penjualan"]
                  return [value, "Jumlah SO"]
                }}
                labelFormatter={(label) => `Bulan: ${label}`}
                contentStyle={{
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" fill="#0f2744" radius={[4, 4, 0, 0]} name="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
