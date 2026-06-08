import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type LowStockItem = {
  itemId: string
  itemCode: string
  itemName: string
  warehouseName: string
  quantity: number
}

interface LowStockAlertProps {
  items: LowStockItem[]
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <CardTitle className="text-lg font-serif">Peringatan Stok Rendah</CardTitle>
        {items.length > 0 && (
          <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
            {items.length} item
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Semua stok dalam kondisi aman.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.itemId}-${item.warehouseName}`}>
                    <TableCell>
                      <Link href={`/items`} className="doc-number hover:underline">
                        {item.itemCode}
                      </Link>
                    </TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.warehouseName}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-red-600">{item.quantity}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
