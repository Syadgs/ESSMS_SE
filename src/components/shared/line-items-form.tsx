"use client"

import { useState } from "react"
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

export type ItemSelectOption = SelectOption & {
  defaultUnitPrice?: number
}

interface LineItemsFormProps {
  items: LineItemRow[]
  itemOptions: ItemSelectOption[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof LineItemRow, value: string | number) => void
  showDiscount?: boolean
}

function DecimalInput({
  value,
  onChange,
  placeholder = "Enter price",
}: {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")
  const [focused, setFocused] = useState(false)

  const displayValue = focused ? draft : value === 0 ? "" : String(value)

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onFocus={() => {
        setFocused(true)
        setDraft(value === 0 ? "" : String(value))
      }}
      onChange={(e) => {
        const raw = e.target.value
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return
        setDraft(raw)
        if (raw === "" || raw === ".") {
          onChange(0)
          return
        }
        const num = parseFloat(raw)
        if (!isNaN(num)) onChange(num)
      }}
      onBlur={() => {
        setFocused(false)
        if (draft === "" || draft === ".") {
          onChange(0)
          return
        }
        const num = parseFloat(draft)
        onChange(isNaN(num) ? 0 : num)
      }}
    />
  )
}

function IntegerInput({
  value,
  onChange,
  min = 1,
  placeholder = "1",
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")
  const [focused, setFocused] = useState(false)

  const displayValue = focused ? draft : value === 0 ? "" : String(value)

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={displayValue}
      onFocus={() => {
        setFocused(true)
        setDraft(value === 0 ? "" : String(value))
      }}
      onChange={(e) => {
        const raw = e.target.value
        if (raw !== "" && !/^\d*$/.test(raw)) return
        setDraft(raw)
        if (raw === "") {
          onChange(0)
          return
        }
        const num = parseInt(raw, 10)
        if (!isNaN(num)) onChange(num)
      }}
      onBlur={() => {
        setFocused(false)
        if (draft === "") {
          onChange(min)
          return
        }
        const num = parseInt(draft, 10)
        onChange(isNaN(num) || num < min ? min : num)
      }}
    />
  )
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

  function handleItemSelect(index: number, itemId: string) {
    onUpdate(index, "itemId", itemId)
    const option = itemOptions.find((opt) => opt.value === itemId)
    if (option?.defaultUnitPrice !== undefined) {
      onUpdate(index, "unitPrice", option.defaultUnitPrice)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-left p-3 font-medium w-24">Qty</th>
              <th className="text-left p-3 font-medium w-36">Unit Price</th>
              {showDiscount && <th className="text-left p-3 font-medium w-24">Discount %</th>}
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
                      onValueChange={(v) => handleItemSelect(index, v)}
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
                    <IntegerInput
                      value={item.quantity}
                      onChange={(value) => onUpdate(index, "quantity", value)}
                    />
                  </td>
                  <td className="p-2">
                    <DecimalInput
                      key={`price-${index}-${item.itemId}`}
                      value={item.unitPrice}
                      onChange={(value) => onUpdate(index, "unitPrice", value)}
                    />
                  </td>
                  {showDiscount && (
                    <td className="p-2">
                      <DecimalInput
                        value={item.discount ?? 0}
                        onChange={(value) => onUpdate(index, "discount", value)}
                        placeholder="0"
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
