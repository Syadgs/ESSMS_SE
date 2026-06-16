"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LineItemsForm, type LineItemRow } from "@/components/shared/line-items-form"
import { createPurchaseOrder } from "@/actions/purchase-order.actions"
import type { SelectOption } from "@/types"

interface POFormProps {
  suppliers: SelectOption[]
  itemOptions: SelectOption[]
}

export function POForm({ suppliers, itemOptions }: POFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [supplierId, setSupplierId] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<LineItemRow[]>([
    { itemId: "", quantity: 1, unitPrice: 0 },
  ])

  function handleAdd() {
    setItems([...items, { itemId: "", quantity: 1, unitPrice: 0 }])
  }

  function handleRemove(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function handleUpdate(index: number, field: keyof LineItemRow, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createPurchaseOrder({
        supplierId,
        expectedDate: expectedDate || undefined,
        notes: notes || undefined,
        items,
      })
      if (result.success) {
        toast.success(result.message)
        router.push(`/purchase-orders/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Supplier *</Label>
          <Select value={supplierId} onValueChange={setSupplierId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date Diharapkan</Label>
          <Input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Item *</Label>
        <LineItemsForm
          items={items}
          itemOptions={itemOptions}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onUpdate={handleUpdate}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Purchase Order"}
        </Button>
      </div>
    </form>
  )
}
