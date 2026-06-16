"use client"

import { useState } from "react"
import { Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PhysicalInventoryRow } from "@/lib/reports/physical-inventory"

interface PhysicalInventoryTableProps {
  rows: PhysicalInventoryRow[]
}

export function PhysicalInventoryTable({ rows }: PhysicalInventoryTableProps) {
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({})

  function getKey(row: PhysicalInventoryRow) {
    return `${row.itemId}-${row.warehouseId}`
  }

  function handleExportCSV() {
    const headers = ["Code Item", "Item Name", "Warehouses", "Unit", "Kategori", "Method Costing", "Qty Sistem", "Qty Fisik", "Variance", "Reorder Point", "Status"]
    const csvRows = rows.map((row) => {
      const key = getKey(row)
      const physicalCount = physicalCounts[key] !== undefined ? Number(physicalCounts[key]) : ""
      const difference = physicalCount !== "" ? physicalCount - row.systemQty : ""
      return [
        row.itemCode,
        row.itemName,
        row.warehouseName,
        row.unit,
        row.category ?? "",
        row.costingMethod,
        row.systemQty,
        physicalCount,
        difference,
        row.reorderPoint,
        row.isBelowReorder ? "UNDER REORDER" : "OK",
      ]
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...csvRows].map((r) => r.map(String).join(",")).join("\n")

    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `physical-inventory-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const belowReorderCount = rows.filter((r) => r.isBelowReorder).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {belowReorderCount > 0 && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{belowReorderCount} items below reorder point</span>
          </div>
        )}
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="ml-auto gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Warehouses</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Method Costing</TableHead>
              <TableHead className="text-right">Qty Sistem</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Physical Qty (Input)</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const key = getKey(row)
              const physicalStr = physicalCounts[key]
              const physicalCount = physicalStr !== undefined ? Number(physicalStr) : null
              const difference = physicalCount !== null ? physicalCount - row.systemQty : null

              return (
                <TableRow key={key} className={row.isBelowReorder ? "bg-amber-50/50" : ""}>
                  <TableCell className="font-mono text-xs">{row.itemCode}</TableCell>
                  <TableCell className="font-medium">{row.itemName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{row.warehouseName}</TableCell>
                  <TableCell className="text-sm">{row.unit}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{row.costingMethod}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{row.systemQty}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.reorderPoint}</TableCell>
                  <TableCell className="text-right">
                    {row.isBelowReorder ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Low</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      min={0}
                      value={physicalCounts[key] ?? ""}
                      onChange={(e) =>
                        setPhysicalCounts((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder="—"
                      className="w-20 text-right border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {difference !== null ? (
                      <span
                        className={
                          difference === 0
                            ? "text-green-600 font-medium"
                            : difference > 0
                            ? "text-blue-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {difference > 0 ? "+" : ""}{difference}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
