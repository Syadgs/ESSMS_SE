"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import type { SelectOption } from "@/types"

export type LineItemRow = {
  itemId: string
  quantity: number
  unitPrice: number
  discount?: number
}

interface LineItemsFormProps {
  items: LineItemRow[]
  itemOptions: SelectOption[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof LineItemRow, value: string | number) => void
  showDiscount?: boolean
}

export function LineItemsForm({
  items,
  itemOptions,
  onAdd,
  onRemove,
  onUpdate,
  showDiscount = false,
}: LineItemsFormProps) {
  const total = items.reduce((sum, item) => {
    const discount = item.discount ?? 0
    const subtotal = item.quantity * item.unitPrice * (1 - discount / 100)
    return sum + subtotal
  }, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-left p-3 font-medium w-24">Qty</th>
              <th className="text-left p-3 font-medium w-36">Harga</th>
              {showDiscount && <th className="text-left p-3 font-medium w-24">Diskon %</th>}
              <th className="text-right p-3 font-medium w-36">Subtotal</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const discount = item.discount ?? 0
              const subtotal = item.quantity * item.unitPrice * (1 - discount / 100)
              return (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <Select
                      value={item.itemId}
                      onValueChange={(v) => onUpdate(index, "itemId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => onUpdate(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  {showDiscount && (
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount ?? 0}
                        onChange={(e) => onUpdate(index, "discount", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                  )}
                  <td className="p-2 text-right font-mono">{formatCurrency(subtotal)}</td>
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" />
        Add Item
      </Button>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-semibold font-mono">{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  )
}
