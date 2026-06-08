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
import { createSalesOrder } from "@/actions/sales-order.actions"
import type { SelectOption } from "@/types"

interface SOFormProps {
  customers: SelectOption[]
  itemOptions: SelectOption[]
}

export function SOForm({ customers, itemOptions }: SOFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [customerId, setCustomerId] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<LineItemRow[]>([
    { itemId: "", quantity: 1, unitPrice: 0, discount: 0 },
  ])

  function handleAdd() {
    setItems([...items, { itemId: "", quantity: 1, unitPrice: 0, discount: 0 }])
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
      const result = await createSalesOrder({
        customerId,
        deliveryDate: deliveryDate || undefined,
        notes: notes || undefined,
        items,
      })
      if (result.success) {
        toast.success(result.message)
        router.push(`/sales-orders/${result.data.id}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <Select value={customerId} onValueChange={setCustomerId} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tanggal Pengiriman</Label>
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Catatan</Label>
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
          showDiscount
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Sales Order"}
        </Button>
      </div>
    </form>
  )
}
