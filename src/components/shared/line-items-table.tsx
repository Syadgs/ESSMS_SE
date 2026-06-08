import { formatCurrency } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type LineItemDisplay = {
  itemCode: string
  itemName: string
  quantity: number
  unitPrice: number
  discount?: number
  subtotal: number
  unit?: string
  extra?: string
}

interface LineItemsTableProps {
  items: LineItemDisplay[]
  showDiscount?: boolean
  extraColumn?: string
}

export function LineItemsTable({ items, showDiscount = false, extraColumn }: LineItemsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            {showDiscount && <TableHead className="text-right">Diskon</TableHead>}
            {extraColumn && <TableHead className="text-right">{extraColumn}</TableHead>}
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell className="text-right font-mono">
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(item.unitPrice)}</TableCell>
              {showDiscount && (
                <TableCell className="text-right font-mono">{item.discount ?? 0}%</TableCell>
              )}
              {extraColumn && <TableCell className="text-right font-mono">{item.extra}</TableCell>}
              <TableCell className="text-right font-mono font-medium">
                {formatCurrency(item.subtotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
